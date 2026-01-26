import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

export async function getDataDir(): Promise<string> {
    const cwd = process.cwd();
    // Try current dir first (for production usually data is copied relative to build or cwd)
    let candidate = path.resolve(cwd, "data");
    if (existsSync(candidate)) return candidate;

    // Try up two levels (for dev where cwd might be apps/site)
    candidate = path.resolve(cwd, "../../data");
    if (existsSync(candidate)) return candidate;

    // Try finding root by looking for pnpm-lock.yaml or similar if needed, but above usually covers repo struct
    // Fallback?
    return path.resolve(cwd, "data");
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
    try {
        if (!existsSync(filePath)) return null;
        const content = await fs.readFile(filePath, "utf-8");
        return JSON.parse(content);
    } catch (e) {
        console.error(`Error reading data file ${filePath}:`, e);
        return null;
    }
}
