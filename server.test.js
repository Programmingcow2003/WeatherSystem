const request = require("supertest");
const https = require("https");

jest.mock("https", () => ({
  request: jest.fn()
}));

const { server } = require("./server");

describe("POST /sample", () => {
  beforeEach(() => {
    https.request.mockImplementation((options, callback) => {
      const events = {};

      const fakeResponse = {
        on: (event, handler) => {
          events[event] = handler;
        }
      };

      callback(fakeResponse);

      process.nextTick(() => {
        if (events["data"]) {
          events["data"](
            JSON.stringify({
              status: "transformed",
              voltage: 0.75,
              temperature: 75
            })
          );
        }
        if (events["end"]) {
          events["end"]();
        }
      });

      return {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      };
    });
  });

  test("should return status received", async () => {
    const response = await request(server)
      .post("/sample")
      .send({
        voltage: [0.43, 0.57, 0.61, 0.75],
        amount: 2
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("received");
  });

  test("should return a sample field in the response", async () => {
    const response = await request(server)
      .post("/sample")
      .send({
        voltage: [0.43, 0.57, 0.61, 0.75],
        amount: 2
      });

    expect(response.body.sample).toBeDefined();
  });

  test("should return an array as sample", async () => {
    const response = await request(server)
      .post("/sample")
      .send({
        voltage: [0.43, 0.57, 0.61, 0.75],
        amount: 2
      });

    expect(Array.isArray(response.body.sample)).toBe(true);
  });

  test("should return transformed results", async () => {
    const response = await request(server)
      .post("/sample")
      .send({
        voltage: [0.43, 0.57, 0.61, 0.75],
        amount: 2
      });

    expect(response.body.transformed).toBeDefined();
    expect(Array.isArray(response.body.transformed)).toBe(true);
    expect(response.body.transformed[0].status).toBe("transformed");
  });

  test("should reject invalid input", async () => {
    const response = await request(server)
      .post("/sample")
      .send({
        voltage: "bad",
        amount: 2
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});

afterAll(() => {
  server.close();
});
