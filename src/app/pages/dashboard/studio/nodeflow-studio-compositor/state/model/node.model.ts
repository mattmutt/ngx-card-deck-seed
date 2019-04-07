import { MessageModel } from "./message.model";
import { SocketConnectorType, SocketModel } from "./socket.model";
import { GridsterItemComponentInterface } from "ngx-card-deck";
import { ViewAssemblyTypeStateResourceLayoutItemSchema } from "ngx-card-deck";

// manages the production of messages over an outbound channel
export class NodeProducerModel {

    private _messages: Set<MessageModel> = new Set();

    get messageCollection(): Set<MessageModel> {
        return this._messages;
    }

    findMessageByTopic(topic: string): MessageModel | undefined {
        return Array.from(this._messages).find((message) => message.topic === topic);
    }

    findMessageBySocket(producerSocket: SocketModel): MessageModel | undefined {
        return Array.from(this._messages).find((message) => message.socket === producerSocket);
    }

    // collection modifiers

    // a set is by definition unique on the value
    addMessage(message: MessageModel): boolean {
        const exists = this._messages.has(message);
        this._messages.add(message);
        return !exists;
    }

    removeMessage(message: MessageModel): boolean {
        return this._messages.delete(message);
    }


}

export class NodeLinkModel {
    producerSocketCollection: Set<SocketModel> = new Set();
    consumerSocketCollection: Set<SocketModel> = new Set();

    managedCollections: Set<Set<SocketModel>>;

    constructor() {

        // view to iterate over known collections
        this.managedCollections = new Set([this.consumerSocketCollection, this.producerSocketCollection]);
    }

    // reused by the pipe `SocketConnectorTypePipe` and orders the sockets consistently
    static sortCollection(collection: Set<SocketModel>): Array<SocketModel> {
        return Array.from(collection)
            .sort((a, b) => a.enabled === b.enabled ? a.topic.localeCompare(b.topic) : a.enabled ? -1 : 1);
    }


    // puts the socket into the set
    // does not allow same socket to be overwritten. Prevents duplication
    addSocket(socket: SocketModel): boolean {
        const collection = this.getCollectionByType(socket.type);

        if (socket.type !== undefined) {
            if (collection.has(socket)) {
                return false;
            }
            collection.add(socket);
            return true;
        } else {
            console.error("type missing from socket model", socket);
            return false;
        }
    }


    removeSocket(socket: SocketModel): boolean {
        const collection = this.getCollectionByType(socket.type);

        if (socket.type !== undefined) {
            return collection.delete(socket);
        } else {
            console.error("type missing from socket model", socket);
            return false;
        }
    }


    // check for presence of socket
    hasSocket(socket: SocketModel, forcedSocketTypeConstraint?: SocketConnectorType): boolean {

        if (socket.type !== undefined) {
            return this.mergeCollection().has(socket);
        }

        // can forcibly constrain on a socket, if for some reason the type is undefined or incorrect
        const constrainingSocketType = forcedSocketTypeConstraint || socket.type;

        return constrainingSocketType === SocketConnectorType.input
            ? this.consumerSocketCollection.has(socket)
            : this.producerSocketCollection.has(socket);
    }


    // places socket into the correct bin
    // if already exists, then operation yields a false flag
    getCollectionByType(type?: SocketConnectorType): Set<SocketModel> {
        if (type === SocketConnectorType.input) {
            return this.consumerSocketCollection;

        } else if (type === SocketConnectorType.output) {
            return this.producerSocketCollection;
        }
        return this.mergeCollection();
    }

    /**
     * look for given socket, optionally constrained by its type
     */
    findSocketById(id: string, type?: SocketConnectorType): SocketModel | undefined {
        return Array.from(this.getCollectionByType(type))
            .find((socket) => socket.id === id && (type !== undefined ? socket.type === type : true));
    }

    /**
     * find best matching socket. Expecting topic to be unique within a give node
     */
    findSocketByTopic(topic: string, type?: SocketConnectorType): SocketModel | undefined {
        return Array.from(this.getCollectionByType(type))
            .find((socket) => socket.topic === topic && (type !== undefined ? socket.type === type : true));
    }

    // coalesces both sets of inputs and outputs
    private mergeCollection(): Set<SocketModel> {
        return new Set<SocketModel>([...this.producerSocketCollection, ...this.consumerSocketCollection]);
    }

}

export class NodeViewModel {
    gridItem: GridsterItemComponentInterface;
}


export class NodeModel {
    producer: NodeProducerModel | undefined;
    link: NodeLinkModel | undefined;

    view: NodeViewModel = new NodeViewModel();


    // deep inspection
    get id(): string {
        return (this.view.gridItem.item as ViewAssemblyTypeStateResourceLayoutItemSchema).resourceId;
    }
}

