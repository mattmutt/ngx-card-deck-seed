import { Pipe, PipeTransform } from "@angular/core";

// remap associated array into list for template iterable form
@Pipe({
    name: "messageModelStateDataIterable"
})
export class MessageModelStateDataIterablePipe implements PipeTransform {
    transform(messageStateDataStruct: object): Array<any> {
        // same ordering as the socket renderings

        return Object.keys(messageStateDataStruct)
            .map((k) => [k as string, messageStateDataStruct[k] as any]);

    }

}
