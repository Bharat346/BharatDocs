const VISION_API_KEY = "AIzaSyDok16Klo6zsukdaE4L6tdYo3cFmCa7lJs";

async function testVision() {
  try {
    console.log("Testing Google Vision API with provided key...");
    // A small red dot as base64
    const dot = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: dot },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) {
       console.error("API Error:", data.error.message);
    } else {
       console.log("API Response OK (received list of responses)");
    }
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

testVision();
