const request = require("supertest");
const app = require("./server");

describe("POST /sample", () => {

  test("should return status received", async () => {
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
    const response = await request(app)
      .post("/sample")
      .send({
        voltage: [0.43, 0.57, 0.61, 0.75],
        amount: 2
      });

    expect(response.body.sample).toBeDefined();
  });

  test("should return an array as sample", async () => {
    const response = await request(app)
      .post("/sample")
      .send({
        voltage: [0.43, 0.57, 0.61, 0.75],
        amount: 2
      });

    expect(Array.isArray(response.body.sample)).toBe(true);
  });

});

afterAll(() => {
  app.close();
});
