import express, { Request, Response } from "express";
import { receiveMessageOnPort } from "worker_threads";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

interface summary {
  name: string;
  cookTime: number;
  ingredients: requiredItem[];
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: { [key: string]: any } = {};

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  // remove hyphens and underscores
  recipeName = recipeName.replace(/[-_]/gi, " ");
  // remove non alphabetical or space characters
  recipeName = recipeName.replace(/[^a-zA-Z\s]/gi, "");
  // make string lowercase
  recipeName = recipeName.toLowerCase();
  // remove trailing and leading whitespace
  recipeName = recipeName.trim();
  // remove extra whitespace between words
  recipeName = recipeName.replace(/\s+/gi, " ");
  // make first letter uppercase
  recipeName = recipeName.charAt(0).toUpperCase() + recipeName.slice(1);
  let index: number;
  // find all lowercase letters with a space before
  while ((index = recipeName.search(/\s[a-z]/)) != -1) {
    // make it uppercase
    recipeName = recipeName.slice(0, index) + " " + recipeName.charAt(index + 1).toUpperCase() + recipeName.slice(index + 2);
  }
  return (recipeName.length > 0 ? recipeName : null);
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  const input = req.body;
  const statusCode = add_entry(input);
  if (statusCode === 200) {
    res.status(statusCode).send({});
  } else {
    res.status(statusCode).send("you burnt the kitchen");
  }
});

const add_entry = (entry: any): number => {
  // correct type
  if (entry.type != "recipe" && entry.type != "ingredient") {
    return 400;
    // correct name
  } else if (cookbook[entry.name] != undefined) {
    return 400;
  }
  // required items must have one element per name
  if (entry.type == "recipe") {
    const requiredItems = entry.requiredItems;
    const seenItems: any[] = [];
    for (const item of requiredItems) {
      if (seenItems.some(seen => seen.name === item.name)) {
        return 400;
      } else {
        seenItems.push(item);
      }
    }
    // check ingredient's cook time
  } else {
    if (entry.cookTime < 0) {
      return 400;
    }
  }
  cookbook[entry.name] = entry;
  return 200;
}

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Request) => {
  const name = req.query;
  const scookTime = get_cook_time(name)
  res.status(500).send("not yet implemented!")
});

const get_cook_time = (name: string): number  => {
  let cook_time = 0;
  const recipe = cookbook[name];
  if (recipe.type === "recipe") {
    for (const reqItems of recipe.requiredItems) {
      cook_time += reqItems.quantity * get_cook_time(reqItems);
    }
  } else if (recipe.type === "ingredient") {
    return recipe.cookTime;
  }
  return cook_time;
}

const get_ing_types = (name: string): {ing: string}[] => {
  const recipe = cookbook[name];
  if (recipe.type === "recipe") {
    for (const reqItem of recipe.requiredItems) {
      if (reqItem.type === "recipe") {

      }
    }
  } else if (recipe.type === "ingredient") {
    return recipe.cookTime;
  }
}

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
