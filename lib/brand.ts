export type Brand<K> = K & {
    readonly __brand__: unique symbol
}
