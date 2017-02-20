import {HTTPFetchNetworkInterface} from "apollo-client";
import {NetworkInterfaceOptions} from "apollo-client/transport/networkInterface";

export interface UploadNetworkInterface extends HTTPFetchNetworkInterface {
}

export default function createNetworkInterface(uriOrInterfaceOpts: string | NetworkInterfaceOptions, secondArgOpts?: NetworkInterfaceOptions): UploadNetworkInterface;
