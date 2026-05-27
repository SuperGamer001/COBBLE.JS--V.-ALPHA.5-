import * as THREE from "three";
import CobblePlugin from "./plugin.js";
export default class EntityManager extends CobblePlugin {
    constructor() {
        // Plugin details
        super();
        this.pluginName = "Entity Manager"; // The name of the plugin

        // Plugin properties
        this.items = [];
    }
}