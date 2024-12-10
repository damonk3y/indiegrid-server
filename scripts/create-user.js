import axios from "axios";
import https from "https";

(async () => {
  console.log("BEGIN ----------------------------");
  console.log("-> Create user script started");

  try {
    const userData = {
      email: "test@example.com",
      password: "@StrongP@ssw0rd"
    };

    console.log(
      `Attempting to create user with email: ${userData.email}`
    );
    const response = await axios.post(
      "https://localhost:8080/users",
      userData,
      {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      }
    );

    console.log("User created successfully:");
    console.log(`Status: ${response.status}`);
    console.log("Response data:", response.data);
  } catch (error) {
    console.error("Error creating user:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server");
    } else {
      console.error("Error message:", error.message);
    }
  }
  console.log("-> Create user script finished");
  console.log("END ----------------------------");
})();
