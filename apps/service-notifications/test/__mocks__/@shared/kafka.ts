export class KafkaService {
  async subscribe(topic: string, handler: (message: any) => Promise<void>) {
    // Mock implementation
  }

  async subscribeToMultiple(subscriptions: Array<{topic: string, handler: (message: any) => Promise<void>}>) {
    // Mock implementation
  }

  async emit(topic: string, message: any) {
    // Mock implementation
  }
}

export const KafkaModule = {
  forRoot: jest.fn().mockReturnValue({
    module: class KafkaModuleMock {},
    providers: [KafkaService],
    exports: [KafkaService]
  })
}
