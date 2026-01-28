import { getTree } from "./data";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

async function testTree() {
  console.log("Testing Docs Tree...");
  const docsTree = await getTree("Docs");
  console.log(JSON.stringify(docsTree, null, 2));

  console.log("Testing Notes Tree...");
  const notesTree = await getTree("Notes");
  console.log(JSON.stringify(notesTree, null, 2));

  process.exit(0);
}

testTree();
