import { SSMHandler } from "../src";

import { __getMocks__ } from "../__mocks__/aws-sdk";

describe("SSMHandler", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        SSMHandler.clearCache();
    });

    it("should get a parameter from SSM when it is not cached", async () => {
        await SSMHandler.getText("/jnj/policygate/public-key/staging");
        expect(__getMocks__.SSMGetParameterMock).toBeCalledTimes(1);
        expect(SSMHandler.cacheHandler.has("/jnj/policygate/public-key/staging")).toBeTruthy();
    });

    it("should get a parameter from SSM when it is cached", async () => {
        await SSMHandler.getJson("/jnj/policygate/public-key/staging");
        expect(SSMHandler.cacheHandler.has("/jnj/policygate/public-key/staging")).toBeTruthy();
        await SSMHandler.getJson("/jnj/policygate/public-key/staging");
        expect(__getMocks__.SSMGetParameterMock).toBeCalledTimes(1);
    });

    it("should get a parameter from SSM when it is not cached", async () => {
        await SSMHandler.getText("/jnj/policygate/public-key/staging", 500);
        expect(__getMocks__.SSMGetParameterMock).toBeCalledTimes(1);
        await new Promise((resolve) => setTimeout(resolve, 600));
        expect(SSMHandler.cacheHandler.has("/jnj/policygate/public-key/staging")).toBeFalsy();
    });

    it("should get a parameter fail when trying to parse json", async () => {
        return expect(SSMHandler.getJson("test")).rejects.toThrowError(
            "Falied to parse test error: Unexpected token e in JSON at position 1",
        );
    });
});
