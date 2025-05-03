import Module from "./dist/hello";
import MainModuleFactory from "./dist/@types/hello";

const mainModuleFactory = Module as typeof MainModuleFactory


export type {MainModule} from "./dist/@types/hello";

export default mainModuleFactory;