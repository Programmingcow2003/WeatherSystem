const request = require("supertest");
const app = require("./server");
describe("POST /sample", () => {
  test("should return status received", async () => {
    // check that the API endpoint responds successfully
    const response = await request(app)
      .post("/sample")
      .send({
        voltage: [0.43, 0.57, 0.61, 0.75],
        amount: 2
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("received");
  });
  test("should return a sample field in the response", async () => {
    // verify that the response includes a sample array
    const response = await request(app)
      .post("/sample")
      .send({
        voltage:[0.43, 0.57, 0.61, 0.75],
        amount: 2
      });
    expect(response.body.sample).toBeDefined();
  });
  test("should return an array as sample", async () => {
    // ensure that the sample returned by the API is an array
    const response = await request(app)
      .post("/sample")
      .send({
        voltage: [0.43, 0.57, 0.61, 0.75],
        amount: 2
      });
    expect(Array.isArray(response.body.sample)).toBe(true);
  });
});
