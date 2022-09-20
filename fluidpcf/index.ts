import FluidController, { IFluidController } from "./FluidController";
import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class fluidpcf implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private mainContainer: HTMLDivElement;
    private FluidController: IFluidController;

    /**
     * Empty constructor.
     */
    constructor() {
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        // Add control initialization code

        this.mainContainer = container;

        const title = window.document.createElement("div");
        title.innerHTML = "Test 1.15.3        ";
        this.mainContainer.append(title);

        const text = window.document.createElement('input');
        text.placeholder = "Container ID"
        const createButton = window.document.createElement("button");
        const pushLog = window.document.createElement('textArea');
        pushLog.style.marginTop = "5px";
        pushLog.style.width = "100%";
        pushLog.style.minHeight = "350px";
        this.FluidController = FluidController((anyObj) => {
            console.log("Received:", JSON.stringify(anyObj));
            pushLog.innerHTML += "\n\n-------------------------";
            pushLog.innerHTML += "\n" + JSON.stringify(anyObj);
        });
        createButton.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();

            this.FluidController.createContainer(() => {
                text.value = this.FluidController.getContainerID() || "";
            });
        }
        createButton.innerText = "Create Container";
        const loadButton = window.document.createElement("button");
        loadButton.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();

            this.FluidController.setContainerID(text.value || "");
            this.FluidController.connectToContainer();
        }
        loadButton.innerText = "Load Container";
        const textToPush = window.document.createElement('input');
        textToPush.style.marginTop = "20px";
        textToPush.placeholder = "Text To Push"
        const pushButton = window.document.createElement("button");
        pushButton.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();

            this.FluidController.pushValueToContainer(textToPush.value);
        }
        pushButton.innerText = "Push Value";
        const pushLogTitle = window.document.createElement('div');
        pushLogTitle.style.marginTop = "20px";
        pushLogTitle.innerHTML = "Messages"
        this.mainContainer.appendChild(text);
        this.mainContainer.appendChild(createButton);
        this.mainContainer.appendChild(loadButton);
        this.mainContainer.appendChild(textToPush);
        this.mainContainer.appendChild(pushButton);
        this.mainContainer.appendChild(pushLogTitle);
        this.mainContainer.appendChild(pushLog);
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Add code to update control view
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
