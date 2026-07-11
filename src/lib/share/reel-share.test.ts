import { describe, expect, it, vi } from "vitest";
import {
  buildReelSharePayload,
  copyReelSharePayload,
  type ReelSharePayload,
} from "./reel-share";

const payload: ReelSharePayload = {
  url: "https://example.test/community/reels?start=r1",
};

describe("buildReelSharePayload", () => {
  it("builds a deep link to the immersive reels route", () => {
    expect(
      buildReelSharePayload({
        id: "reel-knife-grip",
        origin: "http://localhost:3000/",
      }),
    ).toEqual({
      url: "http://localhost:3000/community/reels?start=reel-knife-grip",
    });
  });

  it("encodes the reel id and returns null for an empty id", () => {
    expect(
      buildReelSharePayload({
        id: "r 1",
        origin: "https://sous.test",
      }),
    ).toEqual({
      url: "https://sous.test/community/reels?start=r+1",
    });
    expect(buildReelSharePayload({ id: " " })).toBeNull();
  });
});

describe("copyReelSharePayload", () => {
  it("copies the reel URL", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(copyReelSharePayload(payload, { writeText })).resolves.toBe(
      "copied",
    );

    expect(writeText).toHaveBeenCalledWith(payload.url);
  });

  it("reports clipboard failure and fully unsupported browsers", async () => {
    await expect(
      copyReelSharePayload(payload, {
        writeText: vi.fn().mockRejectedValue(new Error("blocked")),
      }),
    ).resolves.toBe("copy-failed");

    await expect(copyReelSharePayload(payload, {})).resolves.toBe(
      "unsupported",
    );
  });
});
