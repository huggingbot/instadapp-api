// Unwrap a promise
export type Await<T> = T extends PromiseLike<infer U> ? Await<U> : T

// Remove all optional properties of an object
export type DeepRequired<T> = {
  [K in keyof T]-?: DeepRequired<T[K]>
}

// Get an array of object keys as literal values
export const getTypedKeys = <T>(obj: T): Array<keyof T> => {
  return Object.keys(obj) as Array<keyof T>
}

// Get an array of object values as literal value
export const getTypedValues = <T>(obj: T): Array<T[keyof T]> => {
  return Object.values(obj) as Array<T[keyof T]>
}

// Get an array of object values as literal value
export const getTypedEntries = <T>(obj: T): Array<[keyof T, T[keyof T]]> => {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>
}
