import axios from "axios";
import { generateAccessToken } from "./generate-access-token.js";

(async () => {
  console.log("BEGIN ----------------------------");
  console.log("-> Get store stock script started");

  try {
    const storeId = "b4b52528-d9a7-473d-b3c9-e91d54884414";
    const url = `http://localhost:3000/modules/stocks/stores/${storeId}/products`;
    console.log(`Sending GET request to: ${url}`);
    const token = generateAccessToken();

    const response = await axios.get(url, {
      headers: {
        Cookie: `accessToken=${token}`
      }
    });

    console.log(
      `Request successful. Status code: ${response.status}`
    );
    console.log("Response data:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("An error occurred while fetching store stock:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received from the server");
    } else {
      console.error("Error message:", error.message);
    }
  }

  console.log("-> Get store stock script finished");
  console.log("END ----------------------------");
})();
