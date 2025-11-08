
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model StaffOverride
 * 
 */
export type StaffOverride = $Result.DefaultSelection<Prisma.$StaffOverridePayload>
/**
 * Model LoginAudit
 * 
 */
export type LoginAudit = $Result.DefaultSelection<Prisma.$LoginAuditPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  ADMIN: 'ADMIN',
  ADMISIONISTA: 'ADMISIONISTA',
  MEDICO: 'MEDICO'
};

export type Role = (typeof Role)[keyof typeof Role]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more StaffOverrides
 * const staffOverrides = await prisma.staffOverride.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more StaffOverrides
   * const staffOverrides = await prisma.staffOverride.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.staffOverride`: Exposes CRUD operations for the **StaffOverride** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StaffOverrides
    * const staffOverrides = await prisma.staffOverride.findMany()
    * ```
    */
  get staffOverride(): Prisma.StaffOverrideDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.loginAudit`: Exposes CRUD operations for the **LoginAudit** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LoginAudits
    * const loginAudits = await prisma.loginAudit.findMany()
    * ```
    */
  get loginAudit(): Prisma.LoginAuditDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.13.0
   * Query Engine version: 361e86d0ea4987e9f53a565309b3eed797a6bcbd
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    StaffOverride: 'StaffOverride',
    LoginAudit: 'LoginAudit'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "staffOverride" | "loginAudit"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      StaffOverride: {
        payload: Prisma.$StaffOverridePayload<ExtArgs>
        fields: Prisma.StaffOverrideFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StaffOverrideFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffOverridePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StaffOverrideFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffOverridePayload>
          }
          findFirst: {
            args: Prisma.StaffOverrideFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffOverridePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StaffOverrideFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffOverridePayload>
          }
          findMany: {
            args: Prisma.StaffOverrideFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffOverridePayload>[]
          }
          create: {
            args: Prisma.StaffOverrideCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffOverridePayload>
          }
          createMany: {
            args: Prisma.StaffOverrideCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StaffOverrideCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffOverridePayload>[]
          }
          delete: {
            args: Prisma.StaffOverrideDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffOverridePayload>
          }
          update: {
            args: Prisma.StaffOverrideUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffOverridePayload>
          }
          deleteMany: {
            args: Prisma.StaffOverrideDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StaffOverrideUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StaffOverrideUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffOverridePayload>[]
          }
          upsert: {
            args: Prisma.StaffOverrideUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffOverridePayload>
          }
          aggregate: {
            args: Prisma.StaffOverrideAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStaffOverride>
          }
          groupBy: {
            args: Prisma.StaffOverrideGroupByArgs<ExtArgs>
            result: $Utils.Optional<StaffOverrideGroupByOutputType>[]
          }
          count: {
            args: Prisma.StaffOverrideCountArgs<ExtArgs>
            result: $Utils.Optional<StaffOverrideCountAggregateOutputType> | number
          }
        }
      }
      LoginAudit: {
        payload: Prisma.$LoginAuditPayload<ExtArgs>
        fields: Prisma.LoginAuditFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LoginAuditFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAuditPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LoginAuditFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAuditPayload>
          }
          findFirst: {
            args: Prisma.LoginAuditFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAuditPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LoginAuditFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAuditPayload>
          }
          findMany: {
            args: Prisma.LoginAuditFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAuditPayload>[]
          }
          create: {
            args: Prisma.LoginAuditCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAuditPayload>
          }
          createMany: {
            args: Prisma.LoginAuditCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LoginAuditCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAuditPayload>[]
          }
          delete: {
            args: Prisma.LoginAuditDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAuditPayload>
          }
          update: {
            args: Prisma.LoginAuditUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAuditPayload>
          }
          deleteMany: {
            args: Prisma.LoginAuditDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LoginAuditUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LoginAuditUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAuditPayload>[]
          }
          upsert: {
            args: Prisma.LoginAuditUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAuditPayload>
          }
          aggregate: {
            args: Prisma.LoginAuditAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLoginAudit>
          }
          groupBy: {
            args: Prisma.LoginAuditGroupByArgs<ExtArgs>
            result: $Utils.Optional<LoginAuditGroupByOutputType>[]
          }
          count: {
            args: Prisma.LoginAuditCountArgs<ExtArgs>
            result: $Utils.Optional<LoginAuditCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    staffOverride?: StaffOverrideOmit
    loginAudit?: LoginAuditOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model StaffOverride
   */

  export type AggregateStaffOverride = {
    _count: StaffOverrideCountAggregateOutputType | null
    _min: StaffOverrideMinAggregateOutputType | null
    _max: StaffOverrideMaxAggregateOutputType | null
  }

  export type StaffOverrideMinAggregateOutputType = {
    id: string | null
    empleadoCodigo: string | null
    documento: string | null
    nombre: string | null
    roleOverride: $Enums.Role | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StaffOverrideMaxAggregateOutputType = {
    id: string | null
    empleadoCodigo: string | null
    documento: string | null
    nombre: string | null
    roleOverride: $Enums.Role | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StaffOverrideCountAggregateOutputType = {
    id: number
    empleadoCodigo: number
    documento: number
    nombre: number
    roleOverride: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StaffOverrideMinAggregateInputType = {
    id?: true
    empleadoCodigo?: true
    documento?: true
    nombre?: true
    roleOverride?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StaffOverrideMaxAggregateInputType = {
    id?: true
    empleadoCodigo?: true
    documento?: true
    nombre?: true
    roleOverride?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StaffOverrideCountAggregateInputType = {
    id?: true
    empleadoCodigo?: true
    documento?: true
    nombre?: true
    roleOverride?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StaffOverrideAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StaffOverride to aggregate.
     */
    where?: StaffOverrideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StaffOverrides to fetch.
     */
    orderBy?: StaffOverrideOrderByWithRelationInput | StaffOverrideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StaffOverrideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StaffOverrides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StaffOverrides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StaffOverrides
    **/
    _count?: true | StaffOverrideCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StaffOverrideMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StaffOverrideMaxAggregateInputType
  }

  export type GetStaffOverrideAggregateType<T extends StaffOverrideAggregateArgs> = {
        [P in keyof T & keyof AggregateStaffOverride]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStaffOverride[P]>
      : GetScalarType<T[P], AggregateStaffOverride[P]>
  }




  export type StaffOverrideGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StaffOverrideWhereInput
    orderBy?: StaffOverrideOrderByWithAggregationInput | StaffOverrideOrderByWithAggregationInput[]
    by: StaffOverrideScalarFieldEnum[] | StaffOverrideScalarFieldEnum
    having?: StaffOverrideScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StaffOverrideCountAggregateInputType | true
    _min?: StaffOverrideMinAggregateInputType
    _max?: StaffOverrideMaxAggregateInputType
  }

  export type StaffOverrideGroupByOutputType = {
    id: string
    empleadoCodigo: string
    documento: string
    nombre: string | null
    roleOverride: $Enums.Role | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: StaffOverrideCountAggregateOutputType | null
    _min: StaffOverrideMinAggregateOutputType | null
    _max: StaffOverrideMaxAggregateOutputType | null
  }

  type GetStaffOverrideGroupByPayload<T extends StaffOverrideGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StaffOverrideGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StaffOverrideGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StaffOverrideGroupByOutputType[P]>
            : GetScalarType<T[P], StaffOverrideGroupByOutputType[P]>
        }
      >
    >


  export type StaffOverrideSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    empleadoCodigo?: boolean
    documento?: boolean
    nombre?: boolean
    roleOverride?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["staffOverride"]>

  export type StaffOverrideSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    empleadoCodigo?: boolean
    documento?: boolean
    nombre?: boolean
    roleOverride?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["staffOverride"]>

  export type StaffOverrideSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    empleadoCodigo?: boolean
    documento?: boolean
    nombre?: boolean
    roleOverride?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["staffOverride"]>

  export type StaffOverrideSelectScalar = {
    id?: boolean
    empleadoCodigo?: boolean
    documento?: boolean
    nombre?: boolean
    roleOverride?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type StaffOverrideOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "empleadoCodigo" | "documento" | "nombre" | "roleOverride" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["staffOverride"]>

  export type $StaffOverridePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StaffOverride"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      empleadoCodigo: string
      documento: string
      nombre: string | null
      roleOverride: $Enums.Role | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["staffOverride"]>
    composites: {}
  }

  type StaffOverrideGetPayload<S extends boolean | null | undefined | StaffOverrideDefaultArgs> = $Result.GetResult<Prisma.$StaffOverridePayload, S>

  type StaffOverrideCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StaffOverrideFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StaffOverrideCountAggregateInputType | true
    }

  export interface StaffOverrideDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StaffOverride'], meta: { name: 'StaffOverride' } }
    /**
     * Find zero or one StaffOverride that matches the filter.
     * @param {StaffOverrideFindUniqueArgs} args - Arguments to find a StaffOverride
     * @example
     * // Get one StaffOverride
     * const staffOverride = await prisma.staffOverride.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StaffOverrideFindUniqueArgs>(args: SelectSubset<T, StaffOverrideFindUniqueArgs<ExtArgs>>): Prisma__StaffOverrideClient<$Result.GetResult<Prisma.$StaffOverridePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one StaffOverride that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StaffOverrideFindUniqueOrThrowArgs} args - Arguments to find a StaffOverride
     * @example
     * // Get one StaffOverride
     * const staffOverride = await prisma.staffOverride.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StaffOverrideFindUniqueOrThrowArgs>(args: SelectSubset<T, StaffOverrideFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StaffOverrideClient<$Result.GetResult<Prisma.$StaffOverridePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StaffOverride that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffOverrideFindFirstArgs} args - Arguments to find a StaffOverride
     * @example
     * // Get one StaffOverride
     * const staffOverride = await prisma.staffOverride.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StaffOverrideFindFirstArgs>(args?: SelectSubset<T, StaffOverrideFindFirstArgs<ExtArgs>>): Prisma__StaffOverrideClient<$Result.GetResult<Prisma.$StaffOverridePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StaffOverride that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffOverrideFindFirstOrThrowArgs} args - Arguments to find a StaffOverride
     * @example
     * // Get one StaffOverride
     * const staffOverride = await prisma.staffOverride.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StaffOverrideFindFirstOrThrowArgs>(args?: SelectSubset<T, StaffOverrideFindFirstOrThrowArgs<ExtArgs>>): Prisma__StaffOverrideClient<$Result.GetResult<Prisma.$StaffOverridePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more StaffOverrides that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffOverrideFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StaffOverrides
     * const staffOverrides = await prisma.staffOverride.findMany()
     * 
     * // Get first 10 StaffOverrides
     * const staffOverrides = await prisma.staffOverride.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const staffOverrideWithIdOnly = await prisma.staffOverride.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StaffOverrideFindManyArgs>(args?: SelectSubset<T, StaffOverrideFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StaffOverridePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a StaffOverride.
     * @param {StaffOverrideCreateArgs} args - Arguments to create a StaffOverride.
     * @example
     * // Create one StaffOverride
     * const StaffOverride = await prisma.staffOverride.create({
     *   data: {
     *     // ... data to create a StaffOverride
     *   }
     * })
     * 
     */
    create<T extends StaffOverrideCreateArgs>(args: SelectSubset<T, StaffOverrideCreateArgs<ExtArgs>>): Prisma__StaffOverrideClient<$Result.GetResult<Prisma.$StaffOverridePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many StaffOverrides.
     * @param {StaffOverrideCreateManyArgs} args - Arguments to create many StaffOverrides.
     * @example
     * // Create many StaffOverrides
     * const staffOverride = await prisma.staffOverride.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StaffOverrideCreateManyArgs>(args?: SelectSubset<T, StaffOverrideCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many StaffOverrides and returns the data saved in the database.
     * @param {StaffOverrideCreateManyAndReturnArgs} args - Arguments to create many StaffOverrides.
     * @example
     * // Create many StaffOverrides
     * const staffOverride = await prisma.staffOverride.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many StaffOverrides and only return the `id`
     * const staffOverrideWithIdOnly = await prisma.staffOverride.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StaffOverrideCreateManyAndReturnArgs>(args?: SelectSubset<T, StaffOverrideCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StaffOverridePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a StaffOverride.
     * @param {StaffOverrideDeleteArgs} args - Arguments to delete one StaffOverride.
     * @example
     * // Delete one StaffOverride
     * const StaffOverride = await prisma.staffOverride.delete({
     *   where: {
     *     // ... filter to delete one StaffOverride
     *   }
     * })
     * 
     */
    delete<T extends StaffOverrideDeleteArgs>(args: SelectSubset<T, StaffOverrideDeleteArgs<ExtArgs>>): Prisma__StaffOverrideClient<$Result.GetResult<Prisma.$StaffOverridePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one StaffOverride.
     * @param {StaffOverrideUpdateArgs} args - Arguments to update one StaffOverride.
     * @example
     * // Update one StaffOverride
     * const staffOverride = await prisma.staffOverride.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StaffOverrideUpdateArgs>(args: SelectSubset<T, StaffOverrideUpdateArgs<ExtArgs>>): Prisma__StaffOverrideClient<$Result.GetResult<Prisma.$StaffOverridePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more StaffOverrides.
     * @param {StaffOverrideDeleteManyArgs} args - Arguments to filter StaffOverrides to delete.
     * @example
     * // Delete a few StaffOverrides
     * const { count } = await prisma.staffOverride.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StaffOverrideDeleteManyArgs>(args?: SelectSubset<T, StaffOverrideDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StaffOverrides.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffOverrideUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StaffOverrides
     * const staffOverride = await prisma.staffOverride.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StaffOverrideUpdateManyArgs>(args: SelectSubset<T, StaffOverrideUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StaffOverrides and returns the data updated in the database.
     * @param {StaffOverrideUpdateManyAndReturnArgs} args - Arguments to update many StaffOverrides.
     * @example
     * // Update many StaffOverrides
     * const staffOverride = await prisma.staffOverride.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more StaffOverrides and only return the `id`
     * const staffOverrideWithIdOnly = await prisma.staffOverride.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends StaffOverrideUpdateManyAndReturnArgs>(args: SelectSubset<T, StaffOverrideUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StaffOverridePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one StaffOverride.
     * @param {StaffOverrideUpsertArgs} args - Arguments to update or create a StaffOverride.
     * @example
     * // Update or create a StaffOverride
     * const staffOverride = await prisma.staffOverride.upsert({
     *   create: {
     *     // ... data to create a StaffOverride
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StaffOverride we want to update
     *   }
     * })
     */
    upsert<T extends StaffOverrideUpsertArgs>(args: SelectSubset<T, StaffOverrideUpsertArgs<ExtArgs>>): Prisma__StaffOverrideClient<$Result.GetResult<Prisma.$StaffOverridePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of StaffOverrides.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffOverrideCountArgs} args - Arguments to filter StaffOverrides to count.
     * @example
     * // Count the number of StaffOverrides
     * const count = await prisma.staffOverride.count({
     *   where: {
     *     // ... the filter for the StaffOverrides we want to count
     *   }
     * })
    **/
    count<T extends StaffOverrideCountArgs>(
      args?: Subset<T, StaffOverrideCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StaffOverrideCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StaffOverride.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffOverrideAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StaffOverrideAggregateArgs>(args: Subset<T, StaffOverrideAggregateArgs>): Prisma.PrismaPromise<GetStaffOverrideAggregateType<T>>

    /**
     * Group by StaffOverride.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffOverrideGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StaffOverrideGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StaffOverrideGroupByArgs['orderBy'] }
        : { orderBy?: StaffOverrideGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StaffOverrideGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStaffOverrideGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StaffOverride model
   */
  readonly fields: StaffOverrideFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StaffOverride.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StaffOverrideClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the StaffOverride model
   */
  interface StaffOverrideFieldRefs {
    readonly id: FieldRef<"StaffOverride", 'String'>
    readonly empleadoCodigo: FieldRef<"StaffOverride", 'String'>
    readonly documento: FieldRef<"StaffOverride", 'String'>
    readonly nombre: FieldRef<"StaffOverride", 'String'>
    readonly roleOverride: FieldRef<"StaffOverride", 'Role'>
    readonly isActive: FieldRef<"StaffOverride", 'Boolean'>
    readonly createdAt: FieldRef<"StaffOverride", 'DateTime'>
    readonly updatedAt: FieldRef<"StaffOverride", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * StaffOverride findUnique
   */
  export type StaffOverrideFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffOverride
     */
    select?: StaffOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffOverride
     */
    omit?: StaffOverrideOmit<ExtArgs> | null
    /**
     * Filter, which StaffOverride to fetch.
     */
    where: StaffOverrideWhereUniqueInput
  }

  /**
   * StaffOverride findUniqueOrThrow
   */
  export type StaffOverrideFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffOverride
     */
    select?: StaffOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffOverride
     */
    omit?: StaffOverrideOmit<ExtArgs> | null
    /**
     * Filter, which StaffOverride to fetch.
     */
    where: StaffOverrideWhereUniqueInput
  }

  /**
   * StaffOverride findFirst
   */
  export type StaffOverrideFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffOverride
     */
    select?: StaffOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffOverride
     */
    omit?: StaffOverrideOmit<ExtArgs> | null
    /**
     * Filter, which StaffOverride to fetch.
     */
    where?: StaffOverrideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StaffOverrides to fetch.
     */
    orderBy?: StaffOverrideOrderByWithRelationInput | StaffOverrideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StaffOverrides.
     */
    cursor?: StaffOverrideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StaffOverrides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StaffOverrides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StaffOverrides.
     */
    distinct?: StaffOverrideScalarFieldEnum | StaffOverrideScalarFieldEnum[]
  }

  /**
   * StaffOverride findFirstOrThrow
   */
  export type StaffOverrideFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffOverride
     */
    select?: StaffOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffOverride
     */
    omit?: StaffOverrideOmit<ExtArgs> | null
    /**
     * Filter, which StaffOverride to fetch.
     */
    where?: StaffOverrideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StaffOverrides to fetch.
     */
    orderBy?: StaffOverrideOrderByWithRelationInput | StaffOverrideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StaffOverrides.
     */
    cursor?: StaffOverrideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StaffOverrides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StaffOverrides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StaffOverrides.
     */
    distinct?: StaffOverrideScalarFieldEnum | StaffOverrideScalarFieldEnum[]
  }

  /**
   * StaffOverride findMany
   */
  export type StaffOverrideFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffOverride
     */
    select?: StaffOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffOverride
     */
    omit?: StaffOverrideOmit<ExtArgs> | null
    /**
     * Filter, which StaffOverrides to fetch.
     */
    where?: StaffOverrideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StaffOverrides to fetch.
     */
    orderBy?: StaffOverrideOrderByWithRelationInput | StaffOverrideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StaffOverrides.
     */
    cursor?: StaffOverrideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StaffOverrides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StaffOverrides.
     */
    skip?: number
    distinct?: StaffOverrideScalarFieldEnum | StaffOverrideScalarFieldEnum[]
  }

  /**
   * StaffOverride create
   */
  export type StaffOverrideCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffOverride
     */
    select?: StaffOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffOverride
     */
    omit?: StaffOverrideOmit<ExtArgs> | null
    /**
     * The data needed to create a StaffOverride.
     */
    data: XOR<StaffOverrideCreateInput, StaffOverrideUncheckedCreateInput>
  }

  /**
   * StaffOverride createMany
   */
  export type StaffOverrideCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StaffOverrides.
     */
    data: StaffOverrideCreateManyInput | StaffOverrideCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StaffOverride createManyAndReturn
   */
  export type StaffOverrideCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffOverride
     */
    select?: StaffOverrideSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StaffOverride
     */
    omit?: StaffOverrideOmit<ExtArgs> | null
    /**
     * The data used to create many StaffOverrides.
     */
    data: StaffOverrideCreateManyInput | StaffOverrideCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StaffOverride update
   */
  export type StaffOverrideUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffOverride
     */
    select?: StaffOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffOverride
     */
    omit?: StaffOverrideOmit<ExtArgs> | null
    /**
     * The data needed to update a StaffOverride.
     */
    data: XOR<StaffOverrideUpdateInput, StaffOverrideUncheckedUpdateInput>
    /**
     * Choose, which StaffOverride to update.
     */
    where: StaffOverrideWhereUniqueInput
  }

  /**
   * StaffOverride updateMany
   */
  export type StaffOverrideUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StaffOverrides.
     */
    data: XOR<StaffOverrideUpdateManyMutationInput, StaffOverrideUncheckedUpdateManyInput>
    /**
     * Filter which StaffOverrides to update
     */
    where?: StaffOverrideWhereInput
    /**
     * Limit how many StaffOverrides to update.
     */
    limit?: number
  }

  /**
   * StaffOverride updateManyAndReturn
   */
  export type StaffOverrideUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffOverride
     */
    select?: StaffOverrideSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StaffOverride
     */
    omit?: StaffOverrideOmit<ExtArgs> | null
    /**
     * The data used to update StaffOverrides.
     */
    data: XOR<StaffOverrideUpdateManyMutationInput, StaffOverrideUncheckedUpdateManyInput>
    /**
     * Filter which StaffOverrides to update
     */
    where?: StaffOverrideWhereInput
    /**
     * Limit how many StaffOverrides to update.
     */
    limit?: number
  }

  /**
   * StaffOverride upsert
   */
  export type StaffOverrideUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffOverride
     */
    select?: StaffOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffOverride
     */
    omit?: StaffOverrideOmit<ExtArgs> | null
    /**
     * The filter to search for the StaffOverride to update in case it exists.
     */
    where: StaffOverrideWhereUniqueInput
    /**
     * In case the StaffOverride found by the `where` argument doesn't exist, create a new StaffOverride with this data.
     */
    create: XOR<StaffOverrideCreateInput, StaffOverrideUncheckedCreateInput>
    /**
     * In case the StaffOverride was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StaffOverrideUpdateInput, StaffOverrideUncheckedUpdateInput>
  }

  /**
   * StaffOverride delete
   */
  export type StaffOverrideDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffOverride
     */
    select?: StaffOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffOverride
     */
    omit?: StaffOverrideOmit<ExtArgs> | null
    /**
     * Filter which StaffOverride to delete.
     */
    where: StaffOverrideWhereUniqueInput
  }

  /**
   * StaffOverride deleteMany
   */
  export type StaffOverrideDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StaffOverrides to delete
     */
    where?: StaffOverrideWhereInput
    /**
     * Limit how many StaffOverrides to delete.
     */
    limit?: number
  }

  /**
   * StaffOverride without action
   */
  export type StaffOverrideDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffOverride
     */
    select?: StaffOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffOverride
     */
    omit?: StaffOverrideOmit<ExtArgs> | null
  }


  /**
   * Model LoginAudit
   */

  export type AggregateLoginAudit = {
    _count: LoginAuditCountAggregateOutputType | null
    _min: LoginAuditMinAggregateOutputType | null
    _max: LoginAuditMaxAggregateOutputType | null
  }

  export type LoginAuditMinAggregateOutputType = {
    id: string | null
    empleadoCodigo: string | null
    documento: string | null
    success: boolean | null
    ip: string | null
    userAgent: string | null
    createdAt: Date | null
  }

  export type LoginAuditMaxAggregateOutputType = {
    id: string | null
    empleadoCodigo: string | null
    documento: string | null
    success: boolean | null
    ip: string | null
    userAgent: string | null
    createdAt: Date | null
  }

  export type LoginAuditCountAggregateOutputType = {
    id: number
    empleadoCodigo: number
    documento: number
    success: number
    ip: number
    userAgent: number
    createdAt: number
    _all: number
  }


  export type LoginAuditMinAggregateInputType = {
    id?: true
    empleadoCodigo?: true
    documento?: true
    success?: true
    ip?: true
    userAgent?: true
    createdAt?: true
  }

  export type LoginAuditMaxAggregateInputType = {
    id?: true
    empleadoCodigo?: true
    documento?: true
    success?: true
    ip?: true
    userAgent?: true
    createdAt?: true
  }

  export type LoginAuditCountAggregateInputType = {
    id?: true
    empleadoCodigo?: true
    documento?: true
    success?: true
    ip?: true
    userAgent?: true
    createdAt?: true
    _all?: true
  }

  export type LoginAuditAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LoginAudit to aggregate.
     */
    where?: LoginAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoginAudits to fetch.
     */
    orderBy?: LoginAuditOrderByWithRelationInput | LoginAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LoginAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoginAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoginAudits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LoginAudits
    **/
    _count?: true | LoginAuditCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LoginAuditMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LoginAuditMaxAggregateInputType
  }

  export type GetLoginAuditAggregateType<T extends LoginAuditAggregateArgs> = {
        [P in keyof T & keyof AggregateLoginAudit]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLoginAudit[P]>
      : GetScalarType<T[P], AggregateLoginAudit[P]>
  }




  export type LoginAuditGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LoginAuditWhereInput
    orderBy?: LoginAuditOrderByWithAggregationInput | LoginAuditOrderByWithAggregationInput[]
    by: LoginAuditScalarFieldEnum[] | LoginAuditScalarFieldEnum
    having?: LoginAuditScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LoginAuditCountAggregateInputType | true
    _min?: LoginAuditMinAggregateInputType
    _max?: LoginAuditMaxAggregateInputType
  }

  export type LoginAuditGroupByOutputType = {
    id: string
    empleadoCodigo: string
    documento: string
    success: boolean
    ip: string | null
    userAgent: string | null
    createdAt: Date
    _count: LoginAuditCountAggregateOutputType | null
    _min: LoginAuditMinAggregateOutputType | null
    _max: LoginAuditMaxAggregateOutputType | null
  }

  type GetLoginAuditGroupByPayload<T extends LoginAuditGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LoginAuditGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LoginAuditGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LoginAuditGroupByOutputType[P]>
            : GetScalarType<T[P], LoginAuditGroupByOutputType[P]>
        }
      >
    >


  export type LoginAuditSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    empleadoCodigo?: boolean
    documento?: boolean
    success?: boolean
    ip?: boolean
    userAgent?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["loginAudit"]>

  export type LoginAuditSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    empleadoCodigo?: boolean
    documento?: boolean
    success?: boolean
    ip?: boolean
    userAgent?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["loginAudit"]>

  export type LoginAuditSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    empleadoCodigo?: boolean
    documento?: boolean
    success?: boolean
    ip?: boolean
    userAgent?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["loginAudit"]>

  export type LoginAuditSelectScalar = {
    id?: boolean
    empleadoCodigo?: boolean
    documento?: boolean
    success?: boolean
    ip?: boolean
    userAgent?: boolean
    createdAt?: boolean
  }

  export type LoginAuditOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "empleadoCodigo" | "documento" | "success" | "ip" | "userAgent" | "createdAt", ExtArgs["result"]["loginAudit"]>

  export type $LoginAuditPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LoginAudit"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      empleadoCodigo: string
      documento: string
      success: boolean
      ip: string | null
      userAgent: string | null
      createdAt: Date
    }, ExtArgs["result"]["loginAudit"]>
    composites: {}
  }

  type LoginAuditGetPayload<S extends boolean | null | undefined | LoginAuditDefaultArgs> = $Result.GetResult<Prisma.$LoginAuditPayload, S>

  type LoginAuditCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LoginAuditFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LoginAuditCountAggregateInputType | true
    }

  export interface LoginAuditDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LoginAudit'], meta: { name: 'LoginAudit' } }
    /**
     * Find zero or one LoginAudit that matches the filter.
     * @param {LoginAuditFindUniqueArgs} args - Arguments to find a LoginAudit
     * @example
     * // Get one LoginAudit
     * const loginAudit = await prisma.loginAudit.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LoginAuditFindUniqueArgs>(args: SelectSubset<T, LoginAuditFindUniqueArgs<ExtArgs>>): Prisma__LoginAuditClient<$Result.GetResult<Prisma.$LoginAuditPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LoginAudit that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LoginAuditFindUniqueOrThrowArgs} args - Arguments to find a LoginAudit
     * @example
     * // Get one LoginAudit
     * const loginAudit = await prisma.loginAudit.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LoginAuditFindUniqueOrThrowArgs>(args: SelectSubset<T, LoginAuditFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LoginAuditClient<$Result.GetResult<Prisma.$LoginAuditPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LoginAudit that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAuditFindFirstArgs} args - Arguments to find a LoginAudit
     * @example
     * // Get one LoginAudit
     * const loginAudit = await prisma.loginAudit.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LoginAuditFindFirstArgs>(args?: SelectSubset<T, LoginAuditFindFirstArgs<ExtArgs>>): Prisma__LoginAuditClient<$Result.GetResult<Prisma.$LoginAuditPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LoginAudit that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAuditFindFirstOrThrowArgs} args - Arguments to find a LoginAudit
     * @example
     * // Get one LoginAudit
     * const loginAudit = await prisma.loginAudit.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LoginAuditFindFirstOrThrowArgs>(args?: SelectSubset<T, LoginAuditFindFirstOrThrowArgs<ExtArgs>>): Prisma__LoginAuditClient<$Result.GetResult<Prisma.$LoginAuditPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LoginAudits that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAuditFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LoginAudits
     * const loginAudits = await prisma.loginAudit.findMany()
     * 
     * // Get first 10 LoginAudits
     * const loginAudits = await prisma.loginAudit.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const loginAuditWithIdOnly = await prisma.loginAudit.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LoginAuditFindManyArgs>(args?: SelectSubset<T, LoginAuditFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LoginAuditPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LoginAudit.
     * @param {LoginAuditCreateArgs} args - Arguments to create a LoginAudit.
     * @example
     * // Create one LoginAudit
     * const LoginAudit = await prisma.loginAudit.create({
     *   data: {
     *     // ... data to create a LoginAudit
     *   }
     * })
     * 
     */
    create<T extends LoginAuditCreateArgs>(args: SelectSubset<T, LoginAuditCreateArgs<ExtArgs>>): Prisma__LoginAuditClient<$Result.GetResult<Prisma.$LoginAuditPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LoginAudits.
     * @param {LoginAuditCreateManyArgs} args - Arguments to create many LoginAudits.
     * @example
     * // Create many LoginAudits
     * const loginAudit = await prisma.loginAudit.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LoginAuditCreateManyArgs>(args?: SelectSubset<T, LoginAuditCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LoginAudits and returns the data saved in the database.
     * @param {LoginAuditCreateManyAndReturnArgs} args - Arguments to create many LoginAudits.
     * @example
     * // Create many LoginAudits
     * const loginAudit = await prisma.loginAudit.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LoginAudits and only return the `id`
     * const loginAuditWithIdOnly = await prisma.loginAudit.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LoginAuditCreateManyAndReturnArgs>(args?: SelectSubset<T, LoginAuditCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LoginAuditPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LoginAudit.
     * @param {LoginAuditDeleteArgs} args - Arguments to delete one LoginAudit.
     * @example
     * // Delete one LoginAudit
     * const LoginAudit = await prisma.loginAudit.delete({
     *   where: {
     *     // ... filter to delete one LoginAudit
     *   }
     * })
     * 
     */
    delete<T extends LoginAuditDeleteArgs>(args: SelectSubset<T, LoginAuditDeleteArgs<ExtArgs>>): Prisma__LoginAuditClient<$Result.GetResult<Prisma.$LoginAuditPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LoginAudit.
     * @param {LoginAuditUpdateArgs} args - Arguments to update one LoginAudit.
     * @example
     * // Update one LoginAudit
     * const loginAudit = await prisma.loginAudit.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LoginAuditUpdateArgs>(args: SelectSubset<T, LoginAuditUpdateArgs<ExtArgs>>): Prisma__LoginAuditClient<$Result.GetResult<Prisma.$LoginAuditPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LoginAudits.
     * @param {LoginAuditDeleteManyArgs} args - Arguments to filter LoginAudits to delete.
     * @example
     * // Delete a few LoginAudits
     * const { count } = await prisma.loginAudit.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LoginAuditDeleteManyArgs>(args?: SelectSubset<T, LoginAuditDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LoginAudits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAuditUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LoginAudits
     * const loginAudit = await prisma.loginAudit.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LoginAuditUpdateManyArgs>(args: SelectSubset<T, LoginAuditUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LoginAudits and returns the data updated in the database.
     * @param {LoginAuditUpdateManyAndReturnArgs} args - Arguments to update many LoginAudits.
     * @example
     * // Update many LoginAudits
     * const loginAudit = await prisma.loginAudit.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LoginAudits and only return the `id`
     * const loginAuditWithIdOnly = await prisma.loginAudit.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LoginAuditUpdateManyAndReturnArgs>(args: SelectSubset<T, LoginAuditUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LoginAuditPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LoginAudit.
     * @param {LoginAuditUpsertArgs} args - Arguments to update or create a LoginAudit.
     * @example
     * // Update or create a LoginAudit
     * const loginAudit = await prisma.loginAudit.upsert({
     *   create: {
     *     // ... data to create a LoginAudit
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LoginAudit we want to update
     *   }
     * })
     */
    upsert<T extends LoginAuditUpsertArgs>(args: SelectSubset<T, LoginAuditUpsertArgs<ExtArgs>>): Prisma__LoginAuditClient<$Result.GetResult<Prisma.$LoginAuditPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LoginAudits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAuditCountArgs} args - Arguments to filter LoginAudits to count.
     * @example
     * // Count the number of LoginAudits
     * const count = await prisma.loginAudit.count({
     *   where: {
     *     // ... the filter for the LoginAudits we want to count
     *   }
     * })
    **/
    count<T extends LoginAuditCountArgs>(
      args?: Subset<T, LoginAuditCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LoginAuditCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LoginAudit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAuditAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LoginAuditAggregateArgs>(args: Subset<T, LoginAuditAggregateArgs>): Prisma.PrismaPromise<GetLoginAuditAggregateType<T>>

    /**
     * Group by LoginAudit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAuditGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LoginAuditGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LoginAuditGroupByArgs['orderBy'] }
        : { orderBy?: LoginAuditGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LoginAuditGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLoginAuditGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LoginAudit model
   */
  readonly fields: LoginAuditFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LoginAudit.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LoginAuditClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LoginAudit model
   */
  interface LoginAuditFieldRefs {
    readonly id: FieldRef<"LoginAudit", 'String'>
    readonly empleadoCodigo: FieldRef<"LoginAudit", 'String'>
    readonly documento: FieldRef<"LoginAudit", 'String'>
    readonly success: FieldRef<"LoginAudit", 'Boolean'>
    readonly ip: FieldRef<"LoginAudit", 'String'>
    readonly userAgent: FieldRef<"LoginAudit", 'String'>
    readonly createdAt: FieldRef<"LoginAudit", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LoginAudit findUnique
   */
  export type LoginAuditFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAudit
     */
    select?: LoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoginAudit
     */
    omit?: LoginAuditOmit<ExtArgs> | null
    /**
     * Filter, which LoginAudit to fetch.
     */
    where: LoginAuditWhereUniqueInput
  }

  /**
   * LoginAudit findUniqueOrThrow
   */
  export type LoginAuditFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAudit
     */
    select?: LoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoginAudit
     */
    omit?: LoginAuditOmit<ExtArgs> | null
    /**
     * Filter, which LoginAudit to fetch.
     */
    where: LoginAuditWhereUniqueInput
  }

  /**
   * LoginAudit findFirst
   */
  export type LoginAuditFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAudit
     */
    select?: LoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoginAudit
     */
    omit?: LoginAuditOmit<ExtArgs> | null
    /**
     * Filter, which LoginAudit to fetch.
     */
    where?: LoginAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoginAudits to fetch.
     */
    orderBy?: LoginAuditOrderByWithRelationInput | LoginAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LoginAudits.
     */
    cursor?: LoginAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoginAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoginAudits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LoginAudits.
     */
    distinct?: LoginAuditScalarFieldEnum | LoginAuditScalarFieldEnum[]
  }

  /**
   * LoginAudit findFirstOrThrow
   */
  export type LoginAuditFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAudit
     */
    select?: LoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoginAudit
     */
    omit?: LoginAuditOmit<ExtArgs> | null
    /**
     * Filter, which LoginAudit to fetch.
     */
    where?: LoginAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoginAudits to fetch.
     */
    orderBy?: LoginAuditOrderByWithRelationInput | LoginAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LoginAudits.
     */
    cursor?: LoginAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoginAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoginAudits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LoginAudits.
     */
    distinct?: LoginAuditScalarFieldEnum | LoginAuditScalarFieldEnum[]
  }

  /**
   * LoginAudit findMany
   */
  export type LoginAuditFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAudit
     */
    select?: LoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoginAudit
     */
    omit?: LoginAuditOmit<ExtArgs> | null
    /**
     * Filter, which LoginAudits to fetch.
     */
    where?: LoginAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoginAudits to fetch.
     */
    orderBy?: LoginAuditOrderByWithRelationInput | LoginAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LoginAudits.
     */
    cursor?: LoginAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoginAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoginAudits.
     */
    skip?: number
    distinct?: LoginAuditScalarFieldEnum | LoginAuditScalarFieldEnum[]
  }

  /**
   * LoginAudit create
   */
  export type LoginAuditCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAudit
     */
    select?: LoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoginAudit
     */
    omit?: LoginAuditOmit<ExtArgs> | null
    /**
     * The data needed to create a LoginAudit.
     */
    data: XOR<LoginAuditCreateInput, LoginAuditUncheckedCreateInput>
  }

  /**
   * LoginAudit createMany
   */
  export type LoginAuditCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LoginAudits.
     */
    data: LoginAuditCreateManyInput | LoginAuditCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LoginAudit createManyAndReturn
   */
  export type LoginAuditCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAudit
     */
    select?: LoginAuditSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LoginAudit
     */
    omit?: LoginAuditOmit<ExtArgs> | null
    /**
     * The data used to create many LoginAudits.
     */
    data: LoginAuditCreateManyInput | LoginAuditCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LoginAudit update
   */
  export type LoginAuditUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAudit
     */
    select?: LoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoginAudit
     */
    omit?: LoginAuditOmit<ExtArgs> | null
    /**
     * The data needed to update a LoginAudit.
     */
    data: XOR<LoginAuditUpdateInput, LoginAuditUncheckedUpdateInput>
    /**
     * Choose, which LoginAudit to update.
     */
    where: LoginAuditWhereUniqueInput
  }

  /**
   * LoginAudit updateMany
   */
  export type LoginAuditUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LoginAudits.
     */
    data: XOR<LoginAuditUpdateManyMutationInput, LoginAuditUncheckedUpdateManyInput>
    /**
     * Filter which LoginAudits to update
     */
    where?: LoginAuditWhereInput
    /**
     * Limit how many LoginAudits to update.
     */
    limit?: number
  }

  /**
   * LoginAudit updateManyAndReturn
   */
  export type LoginAuditUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAudit
     */
    select?: LoginAuditSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LoginAudit
     */
    omit?: LoginAuditOmit<ExtArgs> | null
    /**
     * The data used to update LoginAudits.
     */
    data: XOR<LoginAuditUpdateManyMutationInput, LoginAuditUncheckedUpdateManyInput>
    /**
     * Filter which LoginAudits to update
     */
    where?: LoginAuditWhereInput
    /**
     * Limit how many LoginAudits to update.
     */
    limit?: number
  }

  /**
   * LoginAudit upsert
   */
  export type LoginAuditUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAudit
     */
    select?: LoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoginAudit
     */
    omit?: LoginAuditOmit<ExtArgs> | null
    /**
     * The filter to search for the LoginAudit to update in case it exists.
     */
    where: LoginAuditWhereUniqueInput
    /**
     * In case the LoginAudit found by the `where` argument doesn't exist, create a new LoginAudit with this data.
     */
    create: XOR<LoginAuditCreateInput, LoginAuditUncheckedCreateInput>
    /**
     * In case the LoginAudit was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LoginAuditUpdateInput, LoginAuditUncheckedUpdateInput>
  }

  /**
   * LoginAudit delete
   */
  export type LoginAuditDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAudit
     */
    select?: LoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoginAudit
     */
    omit?: LoginAuditOmit<ExtArgs> | null
    /**
     * Filter which LoginAudit to delete.
     */
    where: LoginAuditWhereUniqueInput
  }

  /**
   * LoginAudit deleteMany
   */
  export type LoginAuditDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LoginAudits to delete
     */
    where?: LoginAuditWhereInput
    /**
     * Limit how many LoginAudits to delete.
     */
    limit?: number
  }

  /**
   * LoginAudit without action
   */
  export type LoginAuditDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAudit
     */
    select?: LoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoginAudit
     */
    omit?: LoginAuditOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const StaffOverrideScalarFieldEnum: {
    id: 'id',
    empleadoCodigo: 'empleadoCodigo',
    documento: 'documento',
    nombre: 'nombre',
    roleOverride: 'roleOverride',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StaffOverrideScalarFieldEnum = (typeof StaffOverrideScalarFieldEnum)[keyof typeof StaffOverrideScalarFieldEnum]


  export const LoginAuditScalarFieldEnum: {
    id: 'id',
    empleadoCodigo: 'empleadoCodigo',
    documento: 'documento',
    success: 'success',
    ip: 'ip',
    userAgent: 'userAgent',
    createdAt: 'createdAt'
  };

  export type LoginAuditScalarFieldEnum = (typeof LoginAuditScalarFieldEnum)[keyof typeof LoginAuditScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type StaffOverrideWhereInput = {
    AND?: StaffOverrideWhereInput | StaffOverrideWhereInput[]
    OR?: StaffOverrideWhereInput[]
    NOT?: StaffOverrideWhereInput | StaffOverrideWhereInput[]
    id?: StringFilter<"StaffOverride"> | string
    empleadoCodigo?: StringFilter<"StaffOverride"> | string
    documento?: StringFilter<"StaffOverride"> | string
    nombre?: StringNullableFilter<"StaffOverride"> | string | null
    roleOverride?: EnumRoleNullableFilter<"StaffOverride"> | $Enums.Role | null
    isActive?: BoolFilter<"StaffOverride"> | boolean
    createdAt?: DateTimeFilter<"StaffOverride"> | Date | string
    updatedAt?: DateTimeFilter<"StaffOverride"> | Date | string
  }

  export type StaffOverrideOrderByWithRelationInput = {
    id?: SortOrder
    empleadoCodigo?: SortOrder
    documento?: SortOrder
    nombre?: SortOrderInput | SortOrder
    roleOverride?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StaffOverrideWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    empleadoCodigo_documento?: StaffOverrideEmpleadoCodigoDocumentoCompoundUniqueInput
    AND?: StaffOverrideWhereInput | StaffOverrideWhereInput[]
    OR?: StaffOverrideWhereInput[]
    NOT?: StaffOverrideWhereInput | StaffOverrideWhereInput[]
    empleadoCodigo?: StringFilter<"StaffOverride"> | string
    documento?: StringFilter<"StaffOverride"> | string
    nombre?: StringNullableFilter<"StaffOverride"> | string | null
    roleOverride?: EnumRoleNullableFilter<"StaffOverride"> | $Enums.Role | null
    isActive?: BoolFilter<"StaffOverride"> | boolean
    createdAt?: DateTimeFilter<"StaffOverride"> | Date | string
    updatedAt?: DateTimeFilter<"StaffOverride"> | Date | string
  }, "id" | "empleadoCodigo_documento">

  export type StaffOverrideOrderByWithAggregationInput = {
    id?: SortOrder
    empleadoCodigo?: SortOrder
    documento?: SortOrder
    nombre?: SortOrderInput | SortOrder
    roleOverride?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: StaffOverrideCountOrderByAggregateInput
    _max?: StaffOverrideMaxOrderByAggregateInput
    _min?: StaffOverrideMinOrderByAggregateInput
  }

  export type StaffOverrideScalarWhereWithAggregatesInput = {
    AND?: StaffOverrideScalarWhereWithAggregatesInput | StaffOverrideScalarWhereWithAggregatesInput[]
    OR?: StaffOverrideScalarWhereWithAggregatesInput[]
    NOT?: StaffOverrideScalarWhereWithAggregatesInput | StaffOverrideScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"StaffOverride"> | string
    empleadoCodigo?: StringWithAggregatesFilter<"StaffOverride"> | string
    documento?: StringWithAggregatesFilter<"StaffOverride"> | string
    nombre?: StringNullableWithAggregatesFilter<"StaffOverride"> | string | null
    roleOverride?: EnumRoleNullableWithAggregatesFilter<"StaffOverride"> | $Enums.Role | null
    isActive?: BoolWithAggregatesFilter<"StaffOverride"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"StaffOverride"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"StaffOverride"> | Date | string
  }

  export type LoginAuditWhereInput = {
    AND?: LoginAuditWhereInput | LoginAuditWhereInput[]
    OR?: LoginAuditWhereInput[]
    NOT?: LoginAuditWhereInput | LoginAuditWhereInput[]
    id?: StringFilter<"LoginAudit"> | string
    empleadoCodigo?: StringFilter<"LoginAudit"> | string
    documento?: StringFilter<"LoginAudit"> | string
    success?: BoolFilter<"LoginAudit"> | boolean
    ip?: StringNullableFilter<"LoginAudit"> | string | null
    userAgent?: StringNullableFilter<"LoginAudit"> | string | null
    createdAt?: DateTimeFilter<"LoginAudit"> | Date | string
  }

  export type LoginAuditOrderByWithRelationInput = {
    id?: SortOrder
    empleadoCodigo?: SortOrder
    documento?: SortOrder
    success?: SortOrder
    ip?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type LoginAuditWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LoginAuditWhereInput | LoginAuditWhereInput[]
    OR?: LoginAuditWhereInput[]
    NOT?: LoginAuditWhereInput | LoginAuditWhereInput[]
    empleadoCodigo?: StringFilter<"LoginAudit"> | string
    documento?: StringFilter<"LoginAudit"> | string
    success?: BoolFilter<"LoginAudit"> | boolean
    ip?: StringNullableFilter<"LoginAudit"> | string | null
    userAgent?: StringNullableFilter<"LoginAudit"> | string | null
    createdAt?: DateTimeFilter<"LoginAudit"> | Date | string
  }, "id">

  export type LoginAuditOrderByWithAggregationInput = {
    id?: SortOrder
    empleadoCodigo?: SortOrder
    documento?: SortOrder
    success?: SortOrder
    ip?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: LoginAuditCountOrderByAggregateInput
    _max?: LoginAuditMaxOrderByAggregateInput
    _min?: LoginAuditMinOrderByAggregateInput
  }

  export type LoginAuditScalarWhereWithAggregatesInput = {
    AND?: LoginAuditScalarWhereWithAggregatesInput | LoginAuditScalarWhereWithAggregatesInput[]
    OR?: LoginAuditScalarWhereWithAggregatesInput[]
    NOT?: LoginAuditScalarWhereWithAggregatesInput | LoginAuditScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LoginAudit"> | string
    empleadoCodigo?: StringWithAggregatesFilter<"LoginAudit"> | string
    documento?: StringWithAggregatesFilter<"LoginAudit"> | string
    success?: BoolWithAggregatesFilter<"LoginAudit"> | boolean
    ip?: StringNullableWithAggregatesFilter<"LoginAudit"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"LoginAudit"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"LoginAudit"> | Date | string
  }

  export type StaffOverrideCreateInput = {
    id?: string
    empleadoCodigo: string
    documento: string
    nombre?: string | null
    roleOverride?: $Enums.Role | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StaffOverrideUncheckedCreateInput = {
    id?: string
    empleadoCodigo: string
    documento: string
    nombre?: string | null
    roleOverride?: $Enums.Role | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StaffOverrideUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    empleadoCodigo?: StringFieldUpdateOperationsInput | string
    documento?: StringFieldUpdateOperationsInput | string
    nombre?: NullableStringFieldUpdateOperationsInput | string | null
    roleOverride?: NullableEnumRoleFieldUpdateOperationsInput | $Enums.Role | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StaffOverrideUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    empleadoCodigo?: StringFieldUpdateOperationsInput | string
    documento?: StringFieldUpdateOperationsInput | string
    nombre?: NullableStringFieldUpdateOperationsInput | string | null
    roleOverride?: NullableEnumRoleFieldUpdateOperationsInput | $Enums.Role | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StaffOverrideCreateManyInput = {
    id?: string
    empleadoCodigo: string
    documento: string
    nombre?: string | null
    roleOverride?: $Enums.Role | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StaffOverrideUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    empleadoCodigo?: StringFieldUpdateOperationsInput | string
    documento?: StringFieldUpdateOperationsInput | string
    nombre?: NullableStringFieldUpdateOperationsInput | string | null
    roleOverride?: NullableEnumRoleFieldUpdateOperationsInput | $Enums.Role | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StaffOverrideUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    empleadoCodigo?: StringFieldUpdateOperationsInput | string
    documento?: StringFieldUpdateOperationsInput | string
    nombre?: NullableStringFieldUpdateOperationsInput | string | null
    roleOverride?: NullableEnumRoleFieldUpdateOperationsInput | $Enums.Role | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LoginAuditCreateInput = {
    id?: string
    empleadoCodigo: string
    documento: string
    success: boolean
    ip?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type LoginAuditUncheckedCreateInput = {
    id?: string
    empleadoCodigo: string
    documento: string
    success: boolean
    ip?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type LoginAuditUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    empleadoCodigo?: StringFieldUpdateOperationsInput | string
    documento?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    ip?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LoginAuditUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    empleadoCodigo?: StringFieldUpdateOperationsInput | string
    documento?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    ip?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LoginAuditCreateManyInput = {
    id?: string
    empleadoCodigo: string
    documento: string
    success: boolean
    ip?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type LoginAuditUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    empleadoCodigo?: StringFieldUpdateOperationsInput | string
    documento?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    ip?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LoginAuditUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    empleadoCodigo?: StringFieldUpdateOperationsInput | string
    documento?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    ip?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumRoleNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel> | null
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel> | null
    not?: NestedEnumRoleNullableFilter<$PrismaModel> | $Enums.Role | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type StaffOverrideEmpleadoCodigoDocumentoCompoundUniqueInput = {
    empleadoCodigo: string
    documento: string
  }

  export type StaffOverrideCountOrderByAggregateInput = {
    id?: SortOrder
    empleadoCodigo?: SortOrder
    documento?: SortOrder
    nombre?: SortOrder
    roleOverride?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StaffOverrideMaxOrderByAggregateInput = {
    id?: SortOrder
    empleadoCodigo?: SortOrder
    documento?: SortOrder
    nombre?: SortOrder
    roleOverride?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StaffOverrideMinOrderByAggregateInput = {
    id?: SortOrder
    empleadoCodigo?: SortOrder
    documento?: SortOrder
    nombre?: SortOrder
    roleOverride?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumRoleNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel> | null
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel> | null
    not?: NestedEnumRoleNullableWithAggregatesFilter<$PrismaModel> | $Enums.Role | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumRoleNullableFilter<$PrismaModel>
    _max?: NestedEnumRoleNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type LoginAuditCountOrderByAggregateInput = {
    id?: SortOrder
    empleadoCodigo?: SortOrder
    documento?: SortOrder
    success?: SortOrder
    ip?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
  }

  export type LoginAuditMaxOrderByAggregateInput = {
    id?: SortOrder
    empleadoCodigo?: SortOrder
    documento?: SortOrder
    success?: SortOrder
    ip?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
  }

  export type LoginAuditMinOrderByAggregateInput = {
    id?: SortOrder
    empleadoCodigo?: SortOrder
    documento?: SortOrder
    success?: SortOrder
    ip?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableEnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumRoleNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel> | null
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel> | null
    not?: NestedEnumRoleNullableFilter<$PrismaModel> | $Enums.Role | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumRoleNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel> | null
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel> | null
    not?: NestedEnumRoleNullableWithAggregatesFilter<$PrismaModel> | $Enums.Role | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumRoleNullableFilter<$PrismaModel>
    _max?: NestedEnumRoleNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}