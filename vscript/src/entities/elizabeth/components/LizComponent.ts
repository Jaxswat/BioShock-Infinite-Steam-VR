import Elizabeth from "../Elizabeth";
import {BioshockEntityComponent} from "../../BioshockEntityComponent";

export default abstract class LizComponent extends BioshockEntityComponent {
    protected liz: Elizabeth;

    public constructor(liz: Elizabeth) {
        super();
        this.liz = liz;
    }
}
