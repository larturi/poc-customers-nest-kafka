export interface KafkaModuleOptions {
  /**
   * ID único del cliente Kafka
   */
  clientId: string;
  
  /**
   * ID del grupo de consumidores
   */
  groupId: string;
  
  /**
   * Lista de brokers Kafka (opcional, por defecto usa KAFKA_BROKERS env)
   */
  brokers?: string[];
  
  /**
   * Configuración de topics para emitir eventos
   */
  topics?: {
    /**
     * Topics que este servicio puede emitir
     */
    emit?: string[];
    
    /**
     * Topics que este servicio puede consumir
     */
    consume?: string[];
  };
  
  /**
   * Configuración avanzada de Kafka (opcional)
   */
  config?: {
    /**
     * Timeout de conexión en ms (por defecto: 3000)
     */
    connectionTimeout?: number;
    
    /**
     * Timeout de request en ms (por defecto: 30000)
     */
    requestTimeout?: number;
    
    /**
     * Timeout de sesión del consumidor en ms (por defecto: 30000)
     */
    sessionTimeout?: number;
    
    /**
     * Intervalo de heartbeat en ms (por defecto: 3000)
     */
    heartbeatInterval?: number;
    
    /**
     * Timeout de rebalance en ms (por defecto: 60000)
     */
    rebalanceTimeout?: number;
    
    /**
     * Bytes máximos por partición (por defecto: 1048576 - 1MB)
     */
    maxBytesPerPartition?: number;
  };
} 