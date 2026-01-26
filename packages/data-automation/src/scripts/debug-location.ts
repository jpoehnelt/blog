import axios from "axios";
import { JSDOM } from "jsdom";

const url = "https://ultrasignup.com/entrants_event.aspx?did=126946";

async function inspect() {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const doc = dom.window.document;

    console.log("H1:", doc.querySelector("h1")?.textContent?.trim());
    console.log("SubHeader:", doc.querySelector(".sub-header-text")?.textContent?.trim());
    
    const h2s = Array.from(doc.querySelectorAll("h2")).map(h => h.textContent?.trim());
    console.log("H2s:", h2s);
    
    const meta = doc.querySelector("meta[property='og:description']")?.getAttribute("content");
    console.log("OG Description:", meta);
    
    // Dump all classes to help guess
    const allElements = Array.from(doc.querySelectorAll("*"));
    const classes = new Set();
    allElements.forEach(el => el.classList.forEach(c => classes.add(c)));
    console.log("Classes found:", Array.from(classes).filter(c => c.includes("loc") || c.includes("city") || c.includes("event")));

    // Look for Arizona or AZ
    const azElements = allElements.filter(el => el.textContent?.includes("AZ") && el.tagName !== "SCRIPT" && el.tagName !== "STYLE");
    // console.log("Elements with AZ:", azElements.map(el => `${el.tagName}.${el.className} => ${el.textContent?.substring(0, 50)}...`));

    const subHeader = doc.querySelector(".sub-header-text")?.textContent?.trim(); 
    if (subHeader) {
        console.log("SubHeader Chars:", subHeader.split("").map(c => `${c} (${c.charCodeAt(0)})`).join(" "));
        
        // Test split logic
        const parts = subHeader.split(/[\u2022\u00B7|]|\s-\s/).map(s => s.trim());
        console.log("Split parts:", parts);
    }
}

inspect();
