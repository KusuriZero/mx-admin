import { isEqual, isObject, transform } from 'lodash-es'
import { toRaw } from 'vue'

export * from './auth'
export * from './build-menus'
export * from './deps-injection'
export * from './rest'
export * from './time'
export * from './case'

/**
 * diff 两层, Object 浅层比较, 引用不一致返回整个不一样的 Object
 * @param origin
 * @param newObject
 * @returns
 */
export const shallowDiff = <T extends KV>(
  origin: T,
  newObject: T,
): Partial<T> => {
  const diff = {} as Partial<T>

  for (const key in newObject) {
    if (isObject(newObject[key])) {
      const insideObject = newObject[key]
      const originInsideObject = origin[key]
      // shallow compare, 2 层
      Object.keys(toRaw(insideObject)).map((key$) => {
        if (isObject(insideObject[key$])) {
          const insideObject$ = insideObject[key$]
          for (const k in insideObject$) {
            if (insideObject$[k] !== originInsideObject[key$][k]) {
              diff[key] = insideObject

              break
            }
          }
        } else if (insideObject[key$] !== originInsideObject[key$]) {
          diff[key] = insideObject
        }
      })
    } else {
      if (newObject[key] !== origin[key]) {
        diff[key] = newObject[key]
      }
    }
  }

  return diff
}

/**
 * 深层 diff, 返回不一致的 KV
 * @param base
 * @param object
 * @returns
 */
export function deepDiff<T extends KV>(base: T, object: T): Partial<T> {
  function changes(object: any, base: any) {
    return transform(object, function (result: any, value, key) {
      if (!isEqual(value, base[key])) {
        result[key] =
          isObject(value) && isObject(base[key])
            ? changes(value, base[key])
            : value
      }
    })
  }
  return changes(object, base)
}
