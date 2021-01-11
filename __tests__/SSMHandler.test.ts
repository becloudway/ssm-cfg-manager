import { __getMocks__ } from "../__mocks__/aws-sdk/clients/ssm";
import { SSMHandler, StaticSSMHandler } from "../src";

const ssmHandler = new SSMHandler("eu-west-1");

describe("SSMHandler", () => {
    beforeEach(() => {
        ssmHandler.clearCache();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should get a parameter from SSM when it is not cached", async () => {
        await ssmHandler.getText("/jnj/policygate/public-key/staging");
        expect(__getMocks__.SSMGetParameterMock).toBeCalledTimes(1);
        expect(ssmHandler.cacheHandler.has("/jnj/policygate/public-key/staging")).toBeTruthy();
    });

    it("should get a parameter from SSM when it is cached", async () => {
        await ssmHandler.getJson("/jnj/policygate/public-key/staging");
        expect(ssmHandler.cacheHandler.has("/jnj/policygate/public-key/staging")).toBeTruthy();
        await ssmHandler.getJson("/jnj/policygate/public-key/staging");
        expect(__getMocks__.SSMGetParameterMock).toBeCalledTimes(1);
    });

    it("should remove the item from cache when an expiration is set", async () => {
        await ssmHandler.getText("/jnj/policygate/public-key/staging", 500);
        expect(__getMocks__.SSMGetParameterMock).toBeCalledTimes(1);
        await new Promise((resolve) => setTimeout(resolve, 600));
        expect(ssmHandler.cacheHandler.has("/jnj/policygate/public-key/staging")).toBeFalsy();
    });

    it("should remove the item from cache when an expiration is set and get it back automatically", async () => {
        await ssmHandler.getText("/jnj/policygate/public-key/staging", 500);
        expect(__getMocks__.SSMGetParameterMock).toBeCalledTimes(1);
        await new Promise((resolve) => setTimeout(resolve, 600));
        await ssmHandler.getText("/jnj/policygate/public-key/staging");
        expect(__getMocks__.SSMGetParameterMock).toBeCalledTimes(2);
        await new Promise((resolve) => setTimeout(resolve, 600));
        await ssmHandler.getText("/jnj/policygate/public-key/staging");
        expect(__getMocks__.SSMGetParameterMock).toBeCalledTimes(3);
        await ssmHandler.getText("/jnj/policygate/public-key/staging");
        expect(__getMocks__.SSMGetParameterMock).toBeCalledTimes(3);
    });

    it("should get a parameter fail when trying to parse json", async () => {
        return expect(ssmHandler.getJson("test")).rejects.toThrowError(
            "Failed to get uncached JSON key test error: Unexpected token e in JSON at position 1",
        );
    });


    it("Should get a different region", () => {
        expect((ssmHandler as any).ssm.region).toEqual("eu-west-1");
        
        const handler = StaticSSMHandler.getInstance("us-east-1");
        expect((handler as any).ssm.region).toEqual("us-east-1");
    })
});
