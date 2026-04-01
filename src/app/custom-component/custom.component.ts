import {
    Component,
    defineComponent,
    effect,
    signal,
    updateTargets,
    updateValues,
} from "../../framework/core";
import "./custom.component.scss";

export class CustomComponent extends Component {
    templateUrl = "./src/app/custom-component/custom.component.html";

    customProperty = signal<string | null>(null);
    input1!: HTMLInputElement;
    displaySpan!: HTMLElement;

    constructor() {
        super();
    }

    protected onInit() {
        this.domInitializer();

        effect(() => {
            updateValues([this.input1], this.customProperty());
            updateTargets([this.displaySpan], this.customProperty());
        });
    }

    domInitializer() {
        this.input1 = this.querySelector("#input1") as HTMLInputElement;
        this.displaySpan = this.querySelector(
            "#custom-property-display",
        ) as HTMLElement;
    }

    onCustomPropertyClicked(e: MouseEvent) {
        console.log(e);
    }

    onClear() {
        this.customProperty.set(null);
    }
}

defineComponent("custom-component", CustomComponent);
