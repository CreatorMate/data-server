import fs from 'fs';
import path from 'path';
import {BaseController} from "../BaseController";
import {pathToFileURL} from "url";

class RouteLoader {
    async isBaseController(filePath) {
        try {
            // Use pathToFileURL to ensure the file path is properly formatted as a file URL
            const modulePath = pathToFileURL(filePath).href;

            const module = await import(modulePath);

            for (const exportedName in module) {
                const exported = module[exportedName];
                if (
                    typeof exported === 'function' && // Ensure it's a class or constructor
                    Object.getPrototypeOf(exported)?.name === 'BaseController'
                ) {
                    return exported; // Return the class if it matches
                }
            }
            return null;
        } catch (err) {
            console.error(`Error inspecting file ${filePath}:`, err);
            return null;
        }
    }

// Function to search for files containing 'endpoint' in their name
    async findAndRegisterEndpoints(dir, app) {
         // Update with your directory path
        try {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    // Recursively process subdirectories
                    await this.findAndRegisterEndpoints(fullPath, app);
                } else if (entry.isFile() && entry.name.includes('Endpoint') && entry.name.endsWith('.ts')) {
                    const ControllerClass = await this.isBaseController(fullPath);
                    if (ControllerClass) {
                        const controllerInstance = new ControllerClass();
                        console.log(`Registering endpoint from: ${fullPath}`);
                        controllerInstance.register(app); // Dynamically register the route
                    }
                }
            }
        } catch (err) {
            console.error("Error reading directory:", err);
        }
    }
}

export const routeLoader = new RouteLoader();