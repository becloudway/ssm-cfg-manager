import { mockClient, type AwsClientStub } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { SSMHandler, StaticSSMHandler } from "../src";

const ssmHandler = new SSMHandler("eu-west-1");

describe("SSMHandler", () => {
    let mockSSMClient: AwsClientStub<SSMClient>;
    const mockParameterResponse = {
        Parameter: {
            Name: "mockName",
            Value: "mockValue",
        },
    };

    beforeEach(() => {
        mockSSMClient = mockClient(SSMClient);
        mockSSMClient.on(GetParameterCommand).resolves(mockParameterResponse);
        ssmHandler.clearCache();
    });

    afterEach(() => {
        mockSSMClient.reset();
        jest.clearAllMocks();
    });

    it("should get a parameter from SSM when it is not cached", async () => {
        const key = "/jnj/policygate/public-key/staging";

        await ssmHandler.getText(key);

        expect(mockSSMClient).toHaveReceivedCommandTimes(GetParameterCommand, 1);
        expect(mockSSMClient).toHaveReceivedCommandWith(GetParameterCommand, { Name: key, WithDecryption: true });
        expect(ssmHandler.cacheHandler.has(key)).toBeTruthy();
    });

    it("should get a parameter from SSM when it is cached", async () => {
        const key = "/jnj/policygate/public-key/staging";
        mockSSMClient.on(GetParameterCommand).resolves({
            Parameter: {
                Name: mockParameterResponse.Parameter.Name,
                Value: JSON.stringify(mockParameterResponse.Parameter.Value),
            },
        });

        await ssmHandler.getJson(key);
        expect(ssmHandler.cacheHandler.has(key)).toBeTruthy();
        await ssmHandler.getJson(key);
        expect(mockSSMClient).toHaveReceivedCommandTimes(GetParameterCommand, 1);
        expect(mockSSMClient).toHaveReceivedCommandWith(GetParameterCommand, { Name: key, WithDecryption: true });
    });

    it("should remove the item from cache when an expiration is set", async () => {
        const key = "/jnj/policygate/public-key/staging";

        await ssmHandler.getText(key, 500);
        expect(mockSSMClient).toHaveReceivedCommandTimes(GetParameterCommand, 1);
        expect(mockSSMClient).toHaveReceivedCommandWith(GetParameterCommand, { Name: key, WithDecryption: true });
        expect(ssmHandler.cacheHandler.has(key)).toBeTruthy();
        await new Promise((resolve) => setTimeout(resolve, 600));
        expect(ssmHandler.cacheHandler.has(key)).toBeFalsy();
    });

    it("should remove the item from cache when an expiration is set and get it back automatically", async () => {
        const key = "/jnj/policygate/public-key/staging";

        await ssmHandler.getText(key, 500);
        expect(mockSSMClient).toHaveReceivedCommandTimes(GetParameterCommand, 1);
        expect(mockSSMClient).toHaveReceivedCommandWith(GetParameterCommand, { Name: key, WithDecryption: true });
        await new Promise((resolve) => setTimeout(resolve, 600));
        await ssmHandler.getText(key);
        expect(mockSSMClient).toHaveReceivedCommandTimes(GetParameterCommand, 2);
        expect(mockSSMClient).toHaveReceivedCommandWith(GetParameterCommand, { Name: key, WithDecryption: true });
        await new Promise((resolve) => setTimeout(resolve, 600));
        await ssmHandler.getText(key);
        expect(mockSSMClient).toHaveReceivedCommandTimes(GetParameterCommand, 3);
        expect(mockSSMClient).toHaveReceivedCommandWith(GetParameterCommand, { Name: key, WithDecryption: true });
        await ssmHandler.getText(key);
        expect(mockSSMClient).toHaveReceivedCommandTimes(GetParameterCommand, 3);
        expect(mockSSMClient).toHaveReceivedCommandWith(GetParameterCommand, { Name: key, WithDecryption: true });
    });

    it("should get a parameter fail when trying to parse json", async () => {
        await expect(ssmHandler.getJson("test")).rejects.toThrowError(
            `Failed to get uncached JSON key test error: Unexpected token ${mockParameterResponse.Parameter.Value.substring(
                0,
                1,
            )} in JSON at position 0`,
        );
    });

    it("Should get a different region", async () => {
        expect(await (ssmHandler as any).ssm.config.region()).toEqual("eu-west-1");

        const handler = StaticSSMHandler.getInstance("us-east-1");
        expect(await (handler as any).ssm.config.region()).toEqual("us-east-1");
    });
});
