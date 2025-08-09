export class KafkaService {
  async subscribeToMultiple(
    subscriptions: Array<{
      topic: string;
      handler: (message: any) => Promise<void>;
    }>,
  ) {
    // Mock implementation
    return Promise.resolve();
  }

  async subscribe(topic: string, handler: (message: any) => Promise<void>) {
    // Mock implementation
    return Promise.resolve();
  }

  async emit(topic: string, message: any, key?: string) {
    // Mock implementation
    return Promise.resolve();
  }

  async onModuleInit() {
    // Mock implementation
    return Promise.resolve();
  }

  async onModuleDestroy() {
    // Mock implementation
    return Promise.resolve();
  }

  getConfig() {
    // Mock implementation
    return {};
  }
}

export const KafkaModule = {
  forRoot: () => ({
    module: class KafkaModuleMock {},
    providers: [KafkaService],
    exports: [KafkaService],
  }),
};
