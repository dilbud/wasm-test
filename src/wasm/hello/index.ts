import Module from "./dist/hello";
import MainModuleFactory from "./dist/@type/hello";

const mainModuleFactory = Module as typeof MainModuleFactory


export type {MainModule} from "./dist/@type/hello";

export default mainModuleFactory;