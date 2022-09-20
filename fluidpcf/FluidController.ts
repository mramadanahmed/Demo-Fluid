import { AzureClientProps, AzureRemoteConnectionConfig, AzureClient } from "@fluidframework/azure-client";
import { ConnectionState, SharedMap } from "fluid-framework";
import { getRandomName } from "@fluidframework/server-services-client";
import { v4 as uuid } from "uuid";
import { IFluidContainer } from "@fluidframework/fluid-static";
import { InsecureTokenProvider } from '@fluidframework/test-client-utils';

import { ITelemetryBaseLogger, ITelemetryBaseEvent } from "@fluidframework/common-definitions";


export class ConsoleLogger implements ITelemetryBaseLogger {
    constructor() { }
    send(event: ITelemetryBaseEvent) {
        console.log("Fluid Log", JSON.stringify(event));
    }
}

interface IFluidUser {
    id: string,
    name: string
}

const FluidController = (onMessageReceived: (message: string) => void) => {
    var fluidContainer: IFluidContainer;
    var containerId: string;
    var sessionUser: IFluidUser = {
        id: uuid(),
        name: getRandomName(),
    };

    const containerSchema = {
        initialObjects: {
            messages: SharedMap,
        },
    };

    const remoteConnectionConfig: AzureRemoteConnectionConfig = {
        tenantId: '' /*<!-- tenantID -->*/,
        tokenProvider: new InsecureTokenProvider(
            '' /* secret key */,
            sessionUser
        ),
        type: 'remote',
        endpoint: "https://eu.fluidrelay.azure.com"
    }


    const connectionConfig: AzureClientProps = { connection: remoteConnectionConfig, logger: new ConsoleLogger() };

    console.log("new AzureClient() called");
    const client = new AzureClient(connectionConfig);


    const createContainer = async (onResolve?: () => void) => {
        ({ container: fluidContainer } = await client.createContainer(containerSchema));
        console.log("Create Container");
        containerId = await fluidContainer.attach();
        console.log("Container attached: ", containerId);

        onResolve?.();

        if (fluidContainer.connectionState !== ConnectionState.Connected) {
            await new Promise<void>((resolve) => {
                fluidContainer.once("connected", () => {
                    console.log("Container resolved");
                    setHandler();
                    resolve();
                });
            });
        }

        console.log("Container returned");
    }


    const connectToContainer = async () => {
        if (containerId) {
            ({ container: fluidContainer } = await client.getContainer(containerId, containerSchema));
            console.log("Get Container");

            if (fluidContainer.connectionState !== ConnectionState.Connected) {
                await new Promise<void>((resolve) => {
                    fluidContainer.once("connected", () => {
                        console.log("Container resolved");
                        setHandler();
                        resolve();
                    });
                });
            }

            console.log("Container connected");
        }
        else {
            console.log("container is empty")
        }
    }

    const pushValueToContainer = (value: string) => {
        if (fluidContainer) {
            const _sharedMap: SharedMap = fluidContainer.initialObjects.messages as SharedMap;
            _sharedMap.set("value", value);
            console.log("Pushed value", value);
        }
    }

    const setHandler = () => {
        if (fluidContainer) {
            const _sharedMap: SharedMap = fluidContainer.initialObjects.messages as SharedMap;
            const newValue = _sharedMap.get("value");
            console.log("Shared Map Received value", newValue)
            _sharedMap.on('valueChanged', onMessageReceived);
        }

    }

    const setContainerID = (containerID: string) => {
        containerId = containerID;
    }

    const getContainerID = () => {
        return containerId;
    }

    const onMessageReceivedHandler = (callback: (message: unknown) => void) => {
        onMessageReceived = callback;
    }

    return {
        createContainer,
        connectToContainer,
        pushValueToContainer,
        onMessageReceivedHandler,
        setContainerID,
        getContainerID
    }
};

export default FluidController;

export type IFluidController = ReturnType<typeof FluidController>;