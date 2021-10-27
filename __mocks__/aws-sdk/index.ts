export interface AwsSdkMocks {
    SSMGetParameterMock: jest.Mock;
}

const SSMGetParameterMock = jest.fn();

class SSMMock {
    public region: string;
    public constructor({ region }: { region: string }) {
        this.region = region;
    }

    public getParameter(): void {
        return;
    }
}

SSMMock.prototype.getParameter = SSMGetParameterMock.mockImplementation(
    (options) => {
        return options.Name === "test"
            ? {
                  promise: async () => ({
                      Parameter: { Value: "test" },
                  }),
              }
            : {
                  promise: async () => ({
                      Parameter: { Value: JSON.stringify({ test: "test" }) },
                  }),
              };
    }
);

// tslint:disable-next-line:variable-name
export const __getMocks__: AwsSdkMocks = {
    SSMGetParameterMock,
};

export const SSM = SSMMock;
