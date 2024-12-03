// 1- details.seed.ts
// 2- products.seed.ts
// 3- stock.seed.ts
import mainD from "./details.seed";
import mainP from "./products.seed";
import mainS from "./stock.seed";

async function main() {
  //
  mainD();
  mainP();
  mainS();
}

