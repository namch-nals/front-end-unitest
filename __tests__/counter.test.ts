import { vi } from "vitest";

import { setupCounter } from "../src/counter";

describe("Counter Component", () => {
  let button: HTMLButtonElement;

  beforeEach(() => {
    button = document.createElement("button");
    document.body.appendChild(button);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  describe("setupCounter", () => {
    it("should set initial counter value to 0", () => {
      setupCounter(button);
      expect(button.innerHTML).toBe("count is 0");
    });

    it("should increment counter when clicked", () => {
      setupCounter(button);

      button.click();
      expect(button.innerHTML).toBe("count is 1");

      button.click();
      expect(button.innerHTML).toBe("count is 2");
    });

    it("should maintain separate counters for different buttons", () => {
      const button2 = document.createElement("button");
      document.body.appendChild(button2);

      setupCounter(button);
      setupCounter(button2);

      button.click();
      expect(button.innerHTML).toBe("count is 1");
      expect(button2.innerHTML).toBe("count is 0");

      button2.click();
      expect(button.innerHTML).toBe("count is 1");
      expect(button2.innerHTML).toBe("count is 1");
    });

    it("should add event listener to the button", () => {
      const addEventListenerSpy = vi.spyOn(button, "addEventListener");

      setupCounter(button);

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );
    });
  });
});
