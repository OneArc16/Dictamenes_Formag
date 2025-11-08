
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
 * Model agenda
 * This model or at least one of its fields has comments in the database, and requires an additional setup for migrations: Read more: https://pris.ly/d/database-comments
 */
export type agenda = $Result.DefaultSelection<Prisma.$agendaPayload>
/**
 * Model usuarios
 * 
 */
export type usuarios = $Result.DefaultSelection<Prisma.$usuariosPayload>
/**
 * Model empleados
 * 
 */
export type empleados = $Result.DefaultSelection<Prisma.$empleadosPayload>
/**
 * Model especialidad_empleados
 * 
 */
export type especialidad_empleados = $Result.DefaultSelection<Prisma.$especialidad_empleadosPayload>
/**
 * Model especialidadcupsempleado
 * 
 */
export type especialidadcupsempleado = $Result.DefaultSelection<Prisma.$especialidadcupsempleadoPayload>
/**
 * Model tventidades
 * 
 */
export type tventidades = $Result.DefaultSelection<Prisma.$tventidadesPayload>
/**
 * Model tvespecialidades
 * 
 */
export type tvespecialidades = $Result.DefaultSelection<Prisma.$tvespecialidadesPayload>
/**
 * Model tbldetalleremision
 * 
 */
export type tbldetalleremision = $Result.DefaultSelection<Prisma.$tbldetalleremisionPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const usuarios_Capitado: {
  SI: 'SI',
  NO: 'NO'
};

export type usuarios_Capitado = (typeof usuarios_Capitado)[keyof typeof usuarios_Capitado]

}

export type usuarios_Capitado = $Enums.usuarios_Capitado

export const usuarios_Capitado: typeof $Enums.usuarios_Capitado

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Agenda
 * const agenda = await prisma.agenda.findMany()
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
   * // Fetch zero or more Agenda
   * const agenda = await prisma.agenda.findMany()
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
   * `prisma.agenda`: Exposes CRUD operations for the **agenda** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Agenda
    * const agenda = await prisma.agenda.findMany()
    * ```
    */
  get agenda(): Prisma.agendaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.usuarios`: Exposes CRUD operations for the **usuarios** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Usuarios
    * const usuarios = await prisma.usuarios.findMany()
    * ```
    */
  get usuarios(): Prisma.usuariosDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.empleados`: Exposes CRUD operations for the **empleados** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Empleados
    * const empleados = await prisma.empleados.findMany()
    * ```
    */
  get empleados(): Prisma.empleadosDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.especialidad_empleados`: Exposes CRUD operations for the **especialidad_empleados** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Especialidad_empleados
    * const especialidad_empleados = await prisma.especialidad_empleados.findMany()
    * ```
    */
  get especialidad_empleados(): Prisma.especialidad_empleadosDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.especialidadcupsempleado`: Exposes CRUD operations for the **especialidadcupsempleado** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Especialidadcupsempleados
    * const especialidadcupsempleados = await prisma.especialidadcupsempleado.findMany()
    * ```
    */
  get especialidadcupsempleado(): Prisma.especialidadcupsempleadoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tventidades`: Exposes CRUD operations for the **tventidades** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tventidades
    * const tventidades = await prisma.tventidades.findMany()
    * ```
    */
  get tventidades(): Prisma.tventidadesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tvespecialidades`: Exposes CRUD operations for the **tvespecialidades** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tvespecialidades
    * const tvespecialidades = await prisma.tvespecialidades.findMany()
    * ```
    */
  get tvespecialidades(): Prisma.tvespecialidadesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tbldetalleremision`: Exposes CRUD operations for the **tbldetalleremision** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tbldetalleremisions
    * const tbldetalleremisions = await prisma.tbldetalleremision.findMany()
    * ```
    */
  get tbldetalleremision(): Prisma.tbldetalleremisionDelegate<ExtArgs, ClientOptions>;
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
    agenda: 'agenda',
    usuarios: 'usuarios',
    empleados: 'empleados',
    especialidad_empleados: 'especialidad_empleados',
    especialidadcupsempleado: 'especialidadcupsempleado',
    tventidades: 'tventidades',
    tvespecialidades: 'tvespecialidades',
    tbldetalleremision: 'tbldetalleremision'
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
      modelProps: "agenda" | "usuarios" | "empleados" | "especialidad_empleados" | "especialidadcupsempleado" | "tventidades" | "tvespecialidades" | "tbldetalleremision"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      agenda: {
        payload: Prisma.$agendaPayload<ExtArgs>
        fields: Prisma.agendaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.agendaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$agendaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.agendaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$agendaPayload>
          }
          findFirst: {
            args: Prisma.agendaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$agendaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.agendaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$agendaPayload>
          }
          findMany: {
            args: Prisma.agendaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$agendaPayload>[]
          }
          create: {
            args: Prisma.agendaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$agendaPayload>
          }
          createMany: {
            args: Prisma.agendaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.agendaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$agendaPayload>
          }
          update: {
            args: Prisma.agendaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$agendaPayload>
          }
          deleteMany: {
            args: Prisma.agendaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.agendaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.agendaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$agendaPayload>
          }
          aggregate: {
            args: Prisma.AgendaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgenda>
          }
          groupBy: {
            args: Prisma.agendaGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgendaGroupByOutputType>[]
          }
          count: {
            args: Prisma.agendaCountArgs<ExtArgs>
            result: $Utils.Optional<AgendaCountAggregateOutputType> | number
          }
        }
      }
      usuarios: {
        payload: Prisma.$usuariosPayload<ExtArgs>
        fields: Prisma.usuariosFieldRefs
        operations: {
          findUnique: {
            args: Prisma.usuariosFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuariosPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.usuariosFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuariosPayload>
          }
          findFirst: {
            args: Prisma.usuariosFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuariosPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.usuariosFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuariosPayload>
          }
          findMany: {
            args: Prisma.usuariosFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuariosPayload>[]
          }
          create: {
            args: Prisma.usuariosCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuariosPayload>
          }
          createMany: {
            args: Prisma.usuariosCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.usuariosDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuariosPayload>
          }
          update: {
            args: Prisma.usuariosUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuariosPayload>
          }
          deleteMany: {
            args: Prisma.usuariosDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.usuariosUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.usuariosUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuariosPayload>
          }
          aggregate: {
            args: Prisma.UsuariosAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsuarios>
          }
          groupBy: {
            args: Prisma.usuariosGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsuariosGroupByOutputType>[]
          }
          count: {
            args: Prisma.usuariosCountArgs<ExtArgs>
            result: $Utils.Optional<UsuariosCountAggregateOutputType> | number
          }
        }
      }
      empleados: {
        payload: Prisma.$empleadosPayload<ExtArgs>
        fields: Prisma.empleadosFieldRefs
        operations: {
          findUnique: {
            args: Prisma.empleadosFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$empleadosPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.empleadosFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$empleadosPayload>
          }
          findFirst: {
            args: Prisma.empleadosFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$empleadosPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.empleadosFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$empleadosPayload>
          }
          findMany: {
            args: Prisma.empleadosFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$empleadosPayload>[]
          }
          create: {
            args: Prisma.empleadosCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$empleadosPayload>
          }
          createMany: {
            args: Prisma.empleadosCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.empleadosDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$empleadosPayload>
          }
          update: {
            args: Prisma.empleadosUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$empleadosPayload>
          }
          deleteMany: {
            args: Prisma.empleadosDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.empleadosUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.empleadosUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$empleadosPayload>
          }
          aggregate: {
            args: Prisma.EmpleadosAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmpleados>
          }
          groupBy: {
            args: Prisma.empleadosGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmpleadosGroupByOutputType>[]
          }
          count: {
            args: Prisma.empleadosCountArgs<ExtArgs>
            result: $Utils.Optional<EmpleadosCountAggregateOutputType> | number
          }
        }
      }
      especialidad_empleados: {
        payload: Prisma.$especialidad_empleadosPayload<ExtArgs>
        fields: Prisma.especialidad_empleadosFieldRefs
        operations: {
          findUnique: {
            args: Prisma.especialidad_empleadosFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidad_empleadosPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.especialidad_empleadosFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidad_empleadosPayload>
          }
          findFirst: {
            args: Prisma.especialidad_empleadosFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidad_empleadosPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.especialidad_empleadosFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidad_empleadosPayload>
          }
          findMany: {
            args: Prisma.especialidad_empleadosFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidad_empleadosPayload>[]
          }
          create: {
            args: Prisma.especialidad_empleadosCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidad_empleadosPayload>
          }
          createMany: {
            args: Prisma.especialidad_empleadosCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.especialidad_empleadosDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidad_empleadosPayload>
          }
          update: {
            args: Prisma.especialidad_empleadosUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidad_empleadosPayload>
          }
          deleteMany: {
            args: Prisma.especialidad_empleadosDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.especialidad_empleadosUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.especialidad_empleadosUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidad_empleadosPayload>
          }
          aggregate: {
            args: Prisma.Especialidad_empleadosAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEspecialidad_empleados>
          }
          groupBy: {
            args: Prisma.especialidad_empleadosGroupByArgs<ExtArgs>
            result: $Utils.Optional<Especialidad_empleadosGroupByOutputType>[]
          }
          count: {
            args: Prisma.especialidad_empleadosCountArgs<ExtArgs>
            result: $Utils.Optional<Especialidad_empleadosCountAggregateOutputType> | number
          }
        }
      }
      especialidadcupsempleado: {
        payload: Prisma.$especialidadcupsempleadoPayload<ExtArgs>
        fields: Prisma.especialidadcupsempleadoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.especialidadcupsempleadoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidadcupsempleadoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.especialidadcupsempleadoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidadcupsempleadoPayload>
          }
          findFirst: {
            args: Prisma.especialidadcupsempleadoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidadcupsempleadoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.especialidadcupsempleadoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidadcupsempleadoPayload>
          }
          findMany: {
            args: Prisma.especialidadcupsempleadoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidadcupsempleadoPayload>[]
          }
          create: {
            args: Prisma.especialidadcupsempleadoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidadcupsempleadoPayload>
          }
          createMany: {
            args: Prisma.especialidadcupsempleadoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.especialidadcupsempleadoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidadcupsempleadoPayload>
          }
          update: {
            args: Prisma.especialidadcupsempleadoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidadcupsempleadoPayload>
          }
          deleteMany: {
            args: Prisma.especialidadcupsempleadoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.especialidadcupsempleadoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.especialidadcupsempleadoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$especialidadcupsempleadoPayload>
          }
          aggregate: {
            args: Prisma.EspecialidadcupsempleadoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEspecialidadcupsempleado>
          }
          groupBy: {
            args: Prisma.especialidadcupsempleadoGroupByArgs<ExtArgs>
            result: $Utils.Optional<EspecialidadcupsempleadoGroupByOutputType>[]
          }
          count: {
            args: Prisma.especialidadcupsempleadoCountArgs<ExtArgs>
            result: $Utils.Optional<EspecialidadcupsempleadoCountAggregateOutputType> | number
          }
        }
      }
      tventidades: {
        payload: Prisma.$tventidadesPayload<ExtArgs>
        fields: Prisma.tventidadesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tventidadesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tventidadesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tventidadesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tventidadesPayload>
          }
          findFirst: {
            args: Prisma.tventidadesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tventidadesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tventidadesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tventidadesPayload>
          }
          findMany: {
            args: Prisma.tventidadesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tventidadesPayload>[]
          }
          create: {
            args: Prisma.tventidadesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tventidadesPayload>
          }
          createMany: {
            args: Prisma.tventidadesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tventidadesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tventidadesPayload>
          }
          update: {
            args: Prisma.tventidadesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tventidadesPayload>
          }
          deleteMany: {
            args: Prisma.tventidadesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tventidadesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tventidadesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tventidadesPayload>
          }
          aggregate: {
            args: Prisma.TventidadesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTventidades>
          }
          groupBy: {
            args: Prisma.tventidadesGroupByArgs<ExtArgs>
            result: $Utils.Optional<TventidadesGroupByOutputType>[]
          }
          count: {
            args: Prisma.tventidadesCountArgs<ExtArgs>
            result: $Utils.Optional<TventidadesCountAggregateOutputType> | number
          }
        }
      }
      tvespecialidades: {
        payload: Prisma.$tvespecialidadesPayload<ExtArgs>
        fields: Prisma.tvespecialidadesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tvespecialidadesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tvespecialidadesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tvespecialidadesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tvespecialidadesPayload>
          }
          findFirst: {
            args: Prisma.tvespecialidadesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tvespecialidadesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tvespecialidadesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tvespecialidadesPayload>
          }
          findMany: {
            args: Prisma.tvespecialidadesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tvespecialidadesPayload>[]
          }
          create: {
            args: Prisma.tvespecialidadesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tvespecialidadesPayload>
          }
          createMany: {
            args: Prisma.tvespecialidadesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tvespecialidadesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tvespecialidadesPayload>
          }
          update: {
            args: Prisma.tvespecialidadesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tvespecialidadesPayload>
          }
          deleteMany: {
            args: Prisma.tvespecialidadesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tvespecialidadesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tvespecialidadesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tvespecialidadesPayload>
          }
          aggregate: {
            args: Prisma.TvespecialidadesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTvespecialidades>
          }
          groupBy: {
            args: Prisma.tvespecialidadesGroupByArgs<ExtArgs>
            result: $Utils.Optional<TvespecialidadesGroupByOutputType>[]
          }
          count: {
            args: Prisma.tvespecialidadesCountArgs<ExtArgs>
            result: $Utils.Optional<TvespecialidadesCountAggregateOutputType> | number
          }
        }
      }
      tbldetalleremision: {
        payload: Prisma.$tbldetalleremisionPayload<ExtArgs>
        fields: Prisma.tbldetalleremisionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tbldetalleremisionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tbldetalleremisionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tbldetalleremisionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tbldetalleremisionPayload>
          }
          findFirst: {
            args: Prisma.tbldetalleremisionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tbldetalleremisionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tbldetalleremisionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tbldetalleremisionPayload>
          }
          findMany: {
            args: Prisma.tbldetalleremisionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tbldetalleremisionPayload>[]
          }
          create: {
            args: Prisma.tbldetalleremisionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tbldetalleremisionPayload>
          }
          createMany: {
            args: Prisma.tbldetalleremisionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tbldetalleremisionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tbldetalleremisionPayload>
          }
          update: {
            args: Prisma.tbldetalleremisionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tbldetalleremisionPayload>
          }
          deleteMany: {
            args: Prisma.tbldetalleremisionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tbldetalleremisionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tbldetalleremisionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tbldetalleremisionPayload>
          }
          aggregate: {
            args: Prisma.TbldetalleremisionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTbldetalleremision>
          }
          groupBy: {
            args: Prisma.tbldetalleremisionGroupByArgs<ExtArgs>
            result: $Utils.Optional<TbldetalleremisionGroupByOutputType>[]
          }
          count: {
            args: Prisma.tbldetalleremisionCountArgs<ExtArgs>
            result: $Utils.Optional<TbldetalleremisionCountAggregateOutputType> | number
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
    agenda?: agendaOmit
    usuarios?: usuariosOmit
    empleados?: empleadosOmit
    especialidad_empleados?: especialidad_empleadosOmit
    especialidadcupsempleado?: especialidadcupsempleadoOmit
    tventidades?: tventidadesOmit
    tvespecialidades?: tvespecialidadesOmit
    tbldetalleremision?: tbldetalleremisionOmit
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
   * Model agenda
   */

  export type AggregateAgenda = {
    _count: AgendaCountAggregateOutputType | null
    _avg: AgendaAvgAggregateOutputType | null
    _sum: AgendaSumAggregateOutputType | null
    _min: AgendaMinAggregateOutputType | null
    _max: AgendaMaxAggregateOutputType | null
  }

  export type AgendaAvgAggregateOutputType = {
    idagenda: number | null
    IdModalidad: number | null
    Cumplida: number | null
    NoAdmision: number | null
    Gestionada: number | null
    IdCentro: number | null
    IdSede: number | null
  }

  export type AgendaSumAggregateOutputType = {
    idagenda: number | null
    IdModalidad: number | null
    Cumplida: number | null
    NoAdmision: number | null
    Gestionada: number | null
    IdCentro: number | null
    IdSede: number | null
  }

  export type AgendaMinAggregateOutputType = {
    idagenda: number | null
    IdModalidad: number | null
    fecha_solicitud: Date | null
    fecha_cita: Date | null
    idhora: string | null
    idmedico: string | null
    idusuario: string | null
    Telefono: string | null
    Cumplida: number | null
    NoAdmision: number | null
    TipoCita: string | null
    AsignadaPor: string | null
    CanceldaPor: string | null
    Fecha_cancelacion: Date | null
    TipoContrato: string | null
    Entidad: string | null
    MedioSolicitud: string | null
    Finalidad: string | null
    Estado: string | null
    TipoAgenda: string | null
    Activada_por: string | null
    Fecha_Activacion: Date | null
    Gestionada: number | null
    Hora_Activacion: Date | null
    LlegoTarde: string | null
    notificacionrecordatorio: string | null
    notificacioncancelacion: string | null
    notificacion_encuesta: string | null
    Programa: string | null
    clase_cita: string | null
    IdCentro: number | null
    IdSede: number | null
    Bloqueada_Por: string | null
    fecha_bloqueo: Date | null
    cancelada_por: string | null
    paciente_cancelada: string | null
    fecha_cancelada: Date | null
  }

  export type AgendaMaxAggregateOutputType = {
    idagenda: number | null
    IdModalidad: number | null
    fecha_solicitud: Date | null
    fecha_cita: Date | null
    idhora: string | null
    idmedico: string | null
    idusuario: string | null
    Telefono: string | null
    Cumplida: number | null
    NoAdmision: number | null
    TipoCita: string | null
    AsignadaPor: string | null
    CanceldaPor: string | null
    Fecha_cancelacion: Date | null
    TipoContrato: string | null
    Entidad: string | null
    MedioSolicitud: string | null
    Finalidad: string | null
    Estado: string | null
    TipoAgenda: string | null
    Activada_por: string | null
    Fecha_Activacion: Date | null
    Gestionada: number | null
    Hora_Activacion: Date | null
    LlegoTarde: string | null
    notificacionrecordatorio: string | null
    notificacioncancelacion: string | null
    notificacion_encuesta: string | null
    Programa: string | null
    clase_cita: string | null
    IdCentro: number | null
    IdSede: number | null
    Bloqueada_Por: string | null
    fecha_bloqueo: Date | null
    cancelada_por: string | null
    paciente_cancelada: string | null
    fecha_cancelada: Date | null
  }

  export type AgendaCountAggregateOutputType = {
    idagenda: number
    IdModalidad: number
    fecha_solicitud: number
    fecha_cita: number
    idhora: number
    idmedico: number
    idusuario: number
    Telefono: number
    Cumplida: number
    NoAdmision: number
    TipoCita: number
    AsignadaPor: number
    CanceldaPor: number
    Fecha_cancelacion: number
    TipoContrato: number
    Entidad: number
    MedioSolicitud: number
    Finalidad: number
    Estado: number
    TipoAgenda: number
    Activada_por: number
    Fecha_Activacion: number
    Gestionada: number
    Hora_Activacion: number
    LlegoTarde: number
    notificacionrecordatorio: number
    notificacioncancelacion: number
    notificacion_encuesta: number
    Programa: number
    clase_cita: number
    IdCentro: number
    IdSede: number
    Bloqueada_Por: number
    fecha_bloqueo: number
    cancelada_por: number
    paciente_cancelada: number
    fecha_cancelada: number
    _all: number
  }


  export type AgendaAvgAggregateInputType = {
    idagenda?: true
    IdModalidad?: true
    Cumplida?: true
    NoAdmision?: true
    Gestionada?: true
    IdCentro?: true
    IdSede?: true
  }

  export type AgendaSumAggregateInputType = {
    idagenda?: true
    IdModalidad?: true
    Cumplida?: true
    NoAdmision?: true
    Gestionada?: true
    IdCentro?: true
    IdSede?: true
  }

  export type AgendaMinAggregateInputType = {
    idagenda?: true
    IdModalidad?: true
    fecha_solicitud?: true
    fecha_cita?: true
    idhora?: true
    idmedico?: true
    idusuario?: true
    Telefono?: true
    Cumplida?: true
    NoAdmision?: true
    TipoCita?: true
    AsignadaPor?: true
    CanceldaPor?: true
    Fecha_cancelacion?: true
    TipoContrato?: true
    Entidad?: true
    MedioSolicitud?: true
    Finalidad?: true
    Estado?: true
    TipoAgenda?: true
    Activada_por?: true
    Fecha_Activacion?: true
    Gestionada?: true
    Hora_Activacion?: true
    LlegoTarde?: true
    notificacionrecordatorio?: true
    notificacioncancelacion?: true
    notificacion_encuesta?: true
    Programa?: true
    clase_cita?: true
    IdCentro?: true
    IdSede?: true
    Bloqueada_Por?: true
    fecha_bloqueo?: true
    cancelada_por?: true
    paciente_cancelada?: true
    fecha_cancelada?: true
  }

  export type AgendaMaxAggregateInputType = {
    idagenda?: true
    IdModalidad?: true
    fecha_solicitud?: true
    fecha_cita?: true
    idhora?: true
    idmedico?: true
    idusuario?: true
    Telefono?: true
    Cumplida?: true
    NoAdmision?: true
    TipoCita?: true
    AsignadaPor?: true
    CanceldaPor?: true
    Fecha_cancelacion?: true
    TipoContrato?: true
    Entidad?: true
    MedioSolicitud?: true
    Finalidad?: true
    Estado?: true
    TipoAgenda?: true
    Activada_por?: true
    Fecha_Activacion?: true
    Gestionada?: true
    Hora_Activacion?: true
    LlegoTarde?: true
    notificacionrecordatorio?: true
    notificacioncancelacion?: true
    notificacion_encuesta?: true
    Programa?: true
    clase_cita?: true
    IdCentro?: true
    IdSede?: true
    Bloqueada_Por?: true
    fecha_bloqueo?: true
    cancelada_por?: true
    paciente_cancelada?: true
    fecha_cancelada?: true
  }

  export type AgendaCountAggregateInputType = {
    idagenda?: true
    IdModalidad?: true
    fecha_solicitud?: true
    fecha_cita?: true
    idhora?: true
    idmedico?: true
    idusuario?: true
    Telefono?: true
    Cumplida?: true
    NoAdmision?: true
    TipoCita?: true
    AsignadaPor?: true
    CanceldaPor?: true
    Fecha_cancelacion?: true
    TipoContrato?: true
    Entidad?: true
    MedioSolicitud?: true
    Finalidad?: true
    Estado?: true
    TipoAgenda?: true
    Activada_por?: true
    Fecha_Activacion?: true
    Gestionada?: true
    Hora_Activacion?: true
    LlegoTarde?: true
    notificacionrecordatorio?: true
    notificacioncancelacion?: true
    notificacion_encuesta?: true
    Programa?: true
    clase_cita?: true
    IdCentro?: true
    IdSede?: true
    Bloqueada_Por?: true
    fecha_bloqueo?: true
    cancelada_por?: true
    paciente_cancelada?: true
    fecha_cancelada?: true
    _all?: true
  }

  export type AgendaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which agenda to aggregate.
     */
    where?: agendaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of agenda to fetch.
     */
    orderBy?: agendaOrderByWithRelationInput | agendaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: agendaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` agenda from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` agenda.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned agenda
    **/
    _count?: true | AgendaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AgendaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AgendaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgendaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgendaMaxAggregateInputType
  }

  export type GetAgendaAggregateType<T extends AgendaAggregateArgs> = {
        [P in keyof T & keyof AggregateAgenda]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgenda[P]>
      : GetScalarType<T[P], AggregateAgenda[P]>
  }




  export type agendaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: agendaWhereInput
    orderBy?: agendaOrderByWithAggregationInput | agendaOrderByWithAggregationInput[]
    by: AgendaScalarFieldEnum[] | AgendaScalarFieldEnum
    having?: agendaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgendaCountAggregateInputType | true
    _avg?: AgendaAvgAggregateInputType
    _sum?: AgendaSumAggregateInputType
    _min?: AgendaMinAggregateInputType
    _max?: AgendaMaxAggregateInputType
  }

  export type AgendaGroupByOutputType = {
    idagenda: number
    IdModalidad: number
    fecha_solicitud: Date | null
    fecha_cita: Date
    idhora: string
    idmedico: string
    idusuario: string | null
    Telefono: string | null
    Cumplida: number | null
    NoAdmision: number | null
    TipoCita: string | null
    AsignadaPor: string | null
    CanceldaPor: string | null
    Fecha_cancelacion: Date | null
    TipoContrato: string | null
    Entidad: string | null
    MedioSolicitud: string | null
    Finalidad: string | null
    Estado: string | null
    TipoAgenda: string | null
    Activada_por: string | null
    Fecha_Activacion: Date | null
    Gestionada: number | null
    Hora_Activacion: Date | null
    LlegoTarde: string | null
    notificacionrecordatorio: string | null
    notificacioncancelacion: string | null
    notificacion_encuesta: string | null
    Programa: string | null
    clase_cita: string | null
    IdCentro: number | null
    IdSede: number | null
    Bloqueada_Por: string | null
    fecha_bloqueo: Date | null
    cancelada_por: string | null
    paciente_cancelada: string | null
    fecha_cancelada: Date | null
    _count: AgendaCountAggregateOutputType | null
    _avg: AgendaAvgAggregateOutputType | null
    _sum: AgendaSumAggregateOutputType | null
    _min: AgendaMinAggregateOutputType | null
    _max: AgendaMaxAggregateOutputType | null
  }

  type GetAgendaGroupByPayload<T extends agendaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgendaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgendaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgendaGroupByOutputType[P]>
            : GetScalarType<T[P], AgendaGroupByOutputType[P]>
        }
      >
    >


  export type agendaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idagenda?: boolean
    IdModalidad?: boolean
    fecha_solicitud?: boolean
    fecha_cita?: boolean
    idhora?: boolean
    idmedico?: boolean
    idusuario?: boolean
    Telefono?: boolean
    Cumplida?: boolean
    NoAdmision?: boolean
    TipoCita?: boolean
    AsignadaPor?: boolean
    CanceldaPor?: boolean
    Fecha_cancelacion?: boolean
    TipoContrato?: boolean
    Entidad?: boolean
    MedioSolicitud?: boolean
    Finalidad?: boolean
    Estado?: boolean
    TipoAgenda?: boolean
    Activada_por?: boolean
    Fecha_Activacion?: boolean
    Gestionada?: boolean
    Hora_Activacion?: boolean
    LlegoTarde?: boolean
    notificacionrecordatorio?: boolean
    notificacioncancelacion?: boolean
    notificacion_encuesta?: boolean
    Programa?: boolean
    clase_cita?: boolean
    IdCentro?: boolean
    IdSede?: boolean
    Bloqueada_Por?: boolean
    fecha_bloqueo?: boolean
    cancelada_por?: boolean
    paciente_cancelada?: boolean
    fecha_cancelada?: boolean
  }, ExtArgs["result"]["agenda"]>



  export type agendaSelectScalar = {
    idagenda?: boolean
    IdModalidad?: boolean
    fecha_solicitud?: boolean
    fecha_cita?: boolean
    idhora?: boolean
    idmedico?: boolean
    idusuario?: boolean
    Telefono?: boolean
    Cumplida?: boolean
    NoAdmision?: boolean
    TipoCita?: boolean
    AsignadaPor?: boolean
    CanceldaPor?: boolean
    Fecha_cancelacion?: boolean
    TipoContrato?: boolean
    Entidad?: boolean
    MedioSolicitud?: boolean
    Finalidad?: boolean
    Estado?: boolean
    TipoAgenda?: boolean
    Activada_por?: boolean
    Fecha_Activacion?: boolean
    Gestionada?: boolean
    Hora_Activacion?: boolean
    LlegoTarde?: boolean
    notificacionrecordatorio?: boolean
    notificacioncancelacion?: boolean
    notificacion_encuesta?: boolean
    Programa?: boolean
    clase_cita?: boolean
    IdCentro?: boolean
    IdSede?: boolean
    Bloqueada_Por?: boolean
    fecha_bloqueo?: boolean
    cancelada_por?: boolean
    paciente_cancelada?: boolean
    fecha_cancelada?: boolean
  }

  export type agendaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idagenda" | "IdModalidad" | "fecha_solicitud" | "fecha_cita" | "idhora" | "idmedico" | "idusuario" | "Telefono" | "Cumplida" | "NoAdmision" | "TipoCita" | "AsignadaPor" | "CanceldaPor" | "Fecha_cancelacion" | "TipoContrato" | "Entidad" | "MedioSolicitud" | "Finalidad" | "Estado" | "TipoAgenda" | "Activada_por" | "Fecha_Activacion" | "Gestionada" | "Hora_Activacion" | "LlegoTarde" | "notificacionrecordatorio" | "notificacioncancelacion" | "notificacion_encuesta" | "Programa" | "clase_cita" | "IdCentro" | "IdSede" | "Bloqueada_Por" | "fecha_bloqueo" | "cancelada_por" | "paciente_cancelada" | "fecha_cancelada", ExtArgs["result"]["agenda"]>

  export type $agendaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "agenda"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      idagenda: number
      IdModalidad: number
      fecha_solicitud: Date | null
      fecha_cita: Date
      idhora: string
      idmedico: string
      idusuario: string | null
      Telefono: string | null
      Cumplida: number | null
      NoAdmision: number | null
      TipoCita: string | null
      AsignadaPor: string | null
      CanceldaPor: string | null
      Fecha_cancelacion: Date | null
      TipoContrato: string | null
      Entidad: string | null
      MedioSolicitud: string | null
      Finalidad: string | null
      Estado: string | null
      TipoAgenda: string | null
      Activada_por: string | null
      Fecha_Activacion: Date | null
      Gestionada: number | null
      Hora_Activacion: Date | null
      LlegoTarde: string | null
      notificacionrecordatorio: string | null
      notificacioncancelacion: string | null
      notificacion_encuesta: string | null
      Programa: string | null
      clase_cita: string | null
      IdCentro: number | null
      IdSede: number | null
      Bloqueada_Por: string | null
      fecha_bloqueo: Date | null
      cancelada_por: string | null
      paciente_cancelada: string | null
      fecha_cancelada: Date | null
    }, ExtArgs["result"]["agenda"]>
    composites: {}
  }

  type agendaGetPayload<S extends boolean | null | undefined | agendaDefaultArgs> = $Result.GetResult<Prisma.$agendaPayload, S>

  type agendaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<agendaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AgendaCountAggregateInputType | true
    }

  export interface agendaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['agenda'], meta: { name: 'agenda' } }
    /**
     * Find zero or one Agenda that matches the filter.
     * @param {agendaFindUniqueArgs} args - Arguments to find a Agenda
     * @example
     * // Get one Agenda
     * const agenda = await prisma.agenda.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends agendaFindUniqueArgs>(args: SelectSubset<T, agendaFindUniqueArgs<ExtArgs>>): Prisma__agendaClient<$Result.GetResult<Prisma.$agendaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Agenda that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {agendaFindUniqueOrThrowArgs} args - Arguments to find a Agenda
     * @example
     * // Get one Agenda
     * const agenda = await prisma.agenda.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends agendaFindUniqueOrThrowArgs>(args: SelectSubset<T, agendaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__agendaClient<$Result.GetResult<Prisma.$agendaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Agenda that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {agendaFindFirstArgs} args - Arguments to find a Agenda
     * @example
     * // Get one Agenda
     * const agenda = await prisma.agenda.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends agendaFindFirstArgs>(args?: SelectSubset<T, agendaFindFirstArgs<ExtArgs>>): Prisma__agendaClient<$Result.GetResult<Prisma.$agendaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Agenda that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {agendaFindFirstOrThrowArgs} args - Arguments to find a Agenda
     * @example
     * // Get one Agenda
     * const agenda = await prisma.agenda.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends agendaFindFirstOrThrowArgs>(args?: SelectSubset<T, agendaFindFirstOrThrowArgs<ExtArgs>>): Prisma__agendaClient<$Result.GetResult<Prisma.$agendaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Agenda that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {agendaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Agenda
     * const agenda = await prisma.agenda.findMany()
     * 
     * // Get first 10 Agenda
     * const agenda = await prisma.agenda.findMany({ take: 10 })
     * 
     * // Only select the `idagenda`
     * const agendaWithIdagendaOnly = await prisma.agenda.findMany({ select: { idagenda: true } })
     * 
     */
    findMany<T extends agendaFindManyArgs>(args?: SelectSubset<T, agendaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$agendaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Agenda.
     * @param {agendaCreateArgs} args - Arguments to create a Agenda.
     * @example
     * // Create one Agenda
     * const Agenda = await prisma.agenda.create({
     *   data: {
     *     // ... data to create a Agenda
     *   }
     * })
     * 
     */
    create<T extends agendaCreateArgs>(args: SelectSubset<T, agendaCreateArgs<ExtArgs>>): Prisma__agendaClient<$Result.GetResult<Prisma.$agendaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Agenda.
     * @param {agendaCreateManyArgs} args - Arguments to create many Agenda.
     * @example
     * // Create many Agenda
     * const agenda = await prisma.agenda.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends agendaCreateManyArgs>(args?: SelectSubset<T, agendaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Agenda.
     * @param {agendaDeleteArgs} args - Arguments to delete one Agenda.
     * @example
     * // Delete one Agenda
     * const Agenda = await prisma.agenda.delete({
     *   where: {
     *     // ... filter to delete one Agenda
     *   }
     * })
     * 
     */
    delete<T extends agendaDeleteArgs>(args: SelectSubset<T, agendaDeleteArgs<ExtArgs>>): Prisma__agendaClient<$Result.GetResult<Prisma.$agendaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Agenda.
     * @param {agendaUpdateArgs} args - Arguments to update one Agenda.
     * @example
     * // Update one Agenda
     * const agenda = await prisma.agenda.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends agendaUpdateArgs>(args: SelectSubset<T, agendaUpdateArgs<ExtArgs>>): Prisma__agendaClient<$Result.GetResult<Prisma.$agendaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Agenda.
     * @param {agendaDeleteManyArgs} args - Arguments to filter Agenda to delete.
     * @example
     * // Delete a few Agenda
     * const { count } = await prisma.agenda.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends agendaDeleteManyArgs>(args?: SelectSubset<T, agendaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Agenda.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {agendaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Agenda
     * const agenda = await prisma.agenda.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends agendaUpdateManyArgs>(args: SelectSubset<T, agendaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Agenda.
     * @param {agendaUpsertArgs} args - Arguments to update or create a Agenda.
     * @example
     * // Update or create a Agenda
     * const agenda = await prisma.agenda.upsert({
     *   create: {
     *     // ... data to create a Agenda
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Agenda we want to update
     *   }
     * })
     */
    upsert<T extends agendaUpsertArgs>(args: SelectSubset<T, agendaUpsertArgs<ExtArgs>>): Prisma__agendaClient<$Result.GetResult<Prisma.$agendaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Agenda.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {agendaCountArgs} args - Arguments to filter Agenda to count.
     * @example
     * // Count the number of Agenda
     * const count = await prisma.agenda.count({
     *   where: {
     *     // ... the filter for the Agenda we want to count
     *   }
     * })
    **/
    count<T extends agendaCountArgs>(
      args?: Subset<T, agendaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgendaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Agenda.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AgendaAggregateArgs>(args: Subset<T, AgendaAggregateArgs>): Prisma.PrismaPromise<GetAgendaAggregateType<T>>

    /**
     * Group by Agenda.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {agendaGroupByArgs} args - Group by arguments.
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
      T extends agendaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: agendaGroupByArgs['orderBy'] }
        : { orderBy?: agendaGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, agendaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgendaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the agenda model
   */
  readonly fields: agendaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for agenda.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__agendaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the agenda model
   */
  interface agendaFieldRefs {
    readonly idagenda: FieldRef<"agenda", 'Int'>
    readonly IdModalidad: FieldRef<"agenda", 'Int'>
    readonly fecha_solicitud: FieldRef<"agenda", 'DateTime'>
    readonly fecha_cita: FieldRef<"agenda", 'DateTime'>
    readonly idhora: FieldRef<"agenda", 'String'>
    readonly idmedico: FieldRef<"agenda", 'String'>
    readonly idusuario: FieldRef<"agenda", 'String'>
    readonly Telefono: FieldRef<"agenda", 'String'>
    readonly Cumplida: FieldRef<"agenda", 'Int'>
    readonly NoAdmision: FieldRef<"agenda", 'Int'>
    readonly TipoCita: FieldRef<"agenda", 'String'>
    readonly AsignadaPor: FieldRef<"agenda", 'String'>
    readonly CanceldaPor: FieldRef<"agenda", 'String'>
    readonly Fecha_cancelacion: FieldRef<"agenda", 'DateTime'>
    readonly TipoContrato: FieldRef<"agenda", 'String'>
    readonly Entidad: FieldRef<"agenda", 'String'>
    readonly MedioSolicitud: FieldRef<"agenda", 'String'>
    readonly Finalidad: FieldRef<"agenda", 'String'>
    readonly Estado: FieldRef<"agenda", 'String'>
    readonly TipoAgenda: FieldRef<"agenda", 'String'>
    readonly Activada_por: FieldRef<"agenda", 'String'>
    readonly Fecha_Activacion: FieldRef<"agenda", 'DateTime'>
    readonly Gestionada: FieldRef<"agenda", 'Int'>
    readonly Hora_Activacion: FieldRef<"agenda", 'DateTime'>
    readonly LlegoTarde: FieldRef<"agenda", 'String'>
    readonly notificacionrecordatorio: FieldRef<"agenda", 'String'>
    readonly notificacioncancelacion: FieldRef<"agenda", 'String'>
    readonly notificacion_encuesta: FieldRef<"agenda", 'String'>
    readonly Programa: FieldRef<"agenda", 'String'>
    readonly clase_cita: FieldRef<"agenda", 'String'>
    readonly IdCentro: FieldRef<"agenda", 'Int'>
    readonly IdSede: FieldRef<"agenda", 'Int'>
    readonly Bloqueada_Por: FieldRef<"agenda", 'String'>
    readonly fecha_bloqueo: FieldRef<"agenda", 'DateTime'>
    readonly cancelada_por: FieldRef<"agenda", 'String'>
    readonly paciente_cancelada: FieldRef<"agenda", 'String'>
    readonly fecha_cancelada: FieldRef<"agenda", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * agenda findUnique
   */
  export type agendaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the agenda
     */
    select?: agendaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the agenda
     */
    omit?: agendaOmit<ExtArgs> | null
    /**
     * Filter, which agenda to fetch.
     */
    where: agendaWhereUniqueInput
  }

  /**
   * agenda findUniqueOrThrow
   */
  export type agendaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the agenda
     */
    select?: agendaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the agenda
     */
    omit?: agendaOmit<ExtArgs> | null
    /**
     * Filter, which agenda to fetch.
     */
    where: agendaWhereUniqueInput
  }

  /**
   * agenda findFirst
   */
  export type agendaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the agenda
     */
    select?: agendaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the agenda
     */
    omit?: agendaOmit<ExtArgs> | null
    /**
     * Filter, which agenda to fetch.
     */
    where?: agendaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of agenda to fetch.
     */
    orderBy?: agendaOrderByWithRelationInput | agendaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for agenda.
     */
    cursor?: agendaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` agenda from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` agenda.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of agenda.
     */
    distinct?: AgendaScalarFieldEnum | AgendaScalarFieldEnum[]
  }

  /**
   * agenda findFirstOrThrow
   */
  export type agendaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the agenda
     */
    select?: agendaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the agenda
     */
    omit?: agendaOmit<ExtArgs> | null
    /**
     * Filter, which agenda to fetch.
     */
    where?: agendaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of agenda to fetch.
     */
    orderBy?: agendaOrderByWithRelationInput | agendaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for agenda.
     */
    cursor?: agendaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` agenda from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` agenda.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of agenda.
     */
    distinct?: AgendaScalarFieldEnum | AgendaScalarFieldEnum[]
  }

  /**
   * agenda findMany
   */
  export type agendaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the agenda
     */
    select?: agendaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the agenda
     */
    omit?: agendaOmit<ExtArgs> | null
    /**
     * Filter, which agenda to fetch.
     */
    where?: agendaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of agenda to fetch.
     */
    orderBy?: agendaOrderByWithRelationInput | agendaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing agenda.
     */
    cursor?: agendaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` agenda from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` agenda.
     */
    skip?: number
    distinct?: AgendaScalarFieldEnum | AgendaScalarFieldEnum[]
  }

  /**
   * agenda create
   */
  export type agendaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the agenda
     */
    select?: agendaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the agenda
     */
    omit?: agendaOmit<ExtArgs> | null
    /**
     * The data needed to create a agenda.
     */
    data: XOR<agendaCreateInput, agendaUncheckedCreateInput>
  }

  /**
   * agenda createMany
   */
  export type agendaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many agenda.
     */
    data: agendaCreateManyInput | agendaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * agenda update
   */
  export type agendaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the agenda
     */
    select?: agendaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the agenda
     */
    omit?: agendaOmit<ExtArgs> | null
    /**
     * The data needed to update a agenda.
     */
    data: XOR<agendaUpdateInput, agendaUncheckedUpdateInput>
    /**
     * Choose, which agenda to update.
     */
    where: agendaWhereUniqueInput
  }

  /**
   * agenda updateMany
   */
  export type agendaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update agenda.
     */
    data: XOR<agendaUpdateManyMutationInput, agendaUncheckedUpdateManyInput>
    /**
     * Filter which agenda to update
     */
    where?: agendaWhereInput
    /**
     * Limit how many agenda to update.
     */
    limit?: number
  }

  /**
   * agenda upsert
   */
  export type agendaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the agenda
     */
    select?: agendaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the agenda
     */
    omit?: agendaOmit<ExtArgs> | null
    /**
     * The filter to search for the agenda to update in case it exists.
     */
    where: agendaWhereUniqueInput
    /**
     * In case the agenda found by the `where` argument doesn't exist, create a new agenda with this data.
     */
    create: XOR<agendaCreateInput, agendaUncheckedCreateInput>
    /**
     * In case the agenda was found with the provided `where` argument, update it with this data.
     */
    update: XOR<agendaUpdateInput, agendaUncheckedUpdateInput>
  }

  /**
   * agenda delete
   */
  export type agendaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the agenda
     */
    select?: agendaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the agenda
     */
    omit?: agendaOmit<ExtArgs> | null
    /**
     * Filter which agenda to delete.
     */
    where: agendaWhereUniqueInput
  }

  /**
   * agenda deleteMany
   */
  export type agendaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which agenda to delete
     */
    where?: agendaWhereInput
    /**
     * Limit how many agenda to delete.
     */
    limit?: number
  }

  /**
   * agenda without action
   */
  export type agendaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the agenda
     */
    select?: agendaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the agenda
     */
    omit?: agendaOmit<ExtArgs> | null
  }


  /**
   * Model usuarios
   */

  export type AggregateUsuarios = {
    _count: UsuariosCountAggregateOutputType | null
    _avg: UsuariosAvgAggregateOutputType | null
    _sum: UsuariosSumAggregateOutputType | null
    _min: UsuariosMinAggregateOutputType | null
    _max: UsuariosMaxAggregateOutputType | null
  }

  export type UsuariosAvgAggregateOutputType = {
    AL1: number | null
    AL2: number | null
    NumeroSemanasCotizadas: number | null
    NroHijos: number | null
    IdUsuario: number | null
    IdCentro: number | null
  }

  export type UsuariosSumAggregateOutputType = {
    AL1: number | null
    AL2: number | null
    NumeroSemanasCotizadas: number | null
    NroHijos: number | null
    IdUsuario: number | null
    IdCentro: number | null
  }

  export type UsuariosMinAggregateOutputType = {
    Carnet: string | null
    codPrestador: string | null
    Identificaci_n_usuario: string | null
    Tipo_identificaci_n: string | null
    Primer_apellido: string | null
    Segundo_apellido: string | null
    Primer_nombre: string | null
    Segundo_nombre: string | null
    Direcci_n: string | null
    Tel_fono: string | null
    Tipo_usuario: string | null
    Tipo_afiliado: string | null
    C_digo_Ocupaci_n: string | null
    Unidad_edad: string | null
    Edad: string | null
    Sexo: string | null
    Residencia: string | null
    Zona_residencia: string | null
    cedula_afiliado: string | null
    Fecha_nacimient: Date | null
    NHistoria: string | null
    Estado_civil: string | null
    Estado: string | null
    fecha_retiro: Date | null
    Ciudad: string | null
    Sector: string | null
    Nombre_acudiente: string | null
    Telefono_acudiente: string | null
    Antecedente_Patologico1: string | null
    Antecedente_Patologico2: string | null
    Antecedente_Patologico3: string | null
    Antecedente_Quirurgico1: string | null
    Antecedente_Quirurgico2: string | null
    Antecedente_Familiar1: string | null
    Antecedente_Familiar2: string | null
    Antecedente_Familiar3: string | null
    Hemoclasificaci_n: string | null
    RH: string | null
    Fecha_afiliacion: Date | null
    Parentezco: string | null
    Ciudad_cedula: string | null
    Escalafon_afiliado: string | null
    Discapacidad: string | null
    Estrato: string | null
    AL1: number | null
    AL2: number | null
    Cod_medico: string | null
    Codigo_eps: string | null
    Rango: string | null
    Pagos: string | null
    Cod_odontologo: string | null
    Fecha_novedad: Date | null
    Contrato: string | null
    N_mero_afiliaci_n: string | null
    Etnico: string | null
    NumeroSemanasCotizadas: number | null
    LugarNacimiento: string | null
    NroHijos: number | null
    Escolaridad: string | null
    FechaAfiliacion: Date | null
    Celular: string | null
    CorreoElectr_nico: string | null
    Responsable: string | null
    Telefono_Responsable: string | null
    Religion: string | null
    Telefono_Secundario: string | null
    email: string | null
    Fecha_Creado: string | null
    Creado_Por: string | null
    Fecha_Modificado: string | null
    Modificado_por: string | null
    Fecha_Estado: string | null
    Portabilidad: string | null
    Fecha_Portabilidad: string | null
    nombre_disp_asignado: string | null
    Genero: string | null
    Poblacion_Clave: string | null
    Gestacion: string | null
    Victima_del_Conflicto_armado: string | null
    VICTIMA_DEL_MALTRATO: string | null
    ABANDONO_SOCIAL: string | null
    DESESCOLARIZADO: string | null
    DESEMPLEADO: string | null
    CARCELARIO: string | null
    MIGRANTE: string | null
    TRABAJADORA_SEXUAL: string | null
    POBLACION_LGTBI: string | null
    ORIENTACION_SEXUAL: string | null
    Barrio: string | null
    confirmacion_telefono: string | null
    poll: string | null
    Clave: string | null
    codPaisResidencia: string | null
    codMunicipioResidencia: string | null
    codDepartamentoResidencia: string | null
    codPaisOrigen: string | null
    codZonaTerritorialResidencia: string | null
    incapacidad: string | null
    Capitado: $Enums.usuarios_Capitado | null
    IdUsuario: number | null
    IdCentro: number | null
    vacunas_completas: string | null
    intervenciones_quirurgicas: string | null
    alergia: string | null
  }

  export type UsuariosMaxAggregateOutputType = {
    Carnet: string | null
    codPrestador: string | null
    Identificaci_n_usuario: string | null
    Tipo_identificaci_n: string | null
    Primer_apellido: string | null
    Segundo_apellido: string | null
    Primer_nombre: string | null
    Segundo_nombre: string | null
    Direcci_n: string | null
    Tel_fono: string | null
    Tipo_usuario: string | null
    Tipo_afiliado: string | null
    C_digo_Ocupaci_n: string | null
    Unidad_edad: string | null
    Edad: string | null
    Sexo: string | null
    Residencia: string | null
    Zona_residencia: string | null
    cedula_afiliado: string | null
    Fecha_nacimient: Date | null
    NHistoria: string | null
    Estado_civil: string | null
    Estado: string | null
    fecha_retiro: Date | null
    Ciudad: string | null
    Sector: string | null
    Nombre_acudiente: string | null
    Telefono_acudiente: string | null
    Antecedente_Patologico1: string | null
    Antecedente_Patologico2: string | null
    Antecedente_Patologico3: string | null
    Antecedente_Quirurgico1: string | null
    Antecedente_Quirurgico2: string | null
    Antecedente_Familiar1: string | null
    Antecedente_Familiar2: string | null
    Antecedente_Familiar3: string | null
    Hemoclasificaci_n: string | null
    RH: string | null
    Fecha_afiliacion: Date | null
    Parentezco: string | null
    Ciudad_cedula: string | null
    Escalafon_afiliado: string | null
    Discapacidad: string | null
    Estrato: string | null
    AL1: number | null
    AL2: number | null
    Cod_medico: string | null
    Codigo_eps: string | null
    Rango: string | null
    Pagos: string | null
    Cod_odontologo: string | null
    Fecha_novedad: Date | null
    Contrato: string | null
    N_mero_afiliaci_n: string | null
    Etnico: string | null
    NumeroSemanasCotizadas: number | null
    LugarNacimiento: string | null
    NroHijos: number | null
    Escolaridad: string | null
    FechaAfiliacion: Date | null
    Celular: string | null
    CorreoElectr_nico: string | null
    Responsable: string | null
    Telefono_Responsable: string | null
    Religion: string | null
    Telefono_Secundario: string | null
    email: string | null
    Fecha_Creado: string | null
    Creado_Por: string | null
    Fecha_Modificado: string | null
    Modificado_por: string | null
    Fecha_Estado: string | null
    Portabilidad: string | null
    Fecha_Portabilidad: string | null
    nombre_disp_asignado: string | null
    Genero: string | null
    Poblacion_Clave: string | null
    Gestacion: string | null
    Victima_del_Conflicto_armado: string | null
    VICTIMA_DEL_MALTRATO: string | null
    ABANDONO_SOCIAL: string | null
    DESESCOLARIZADO: string | null
    DESEMPLEADO: string | null
    CARCELARIO: string | null
    MIGRANTE: string | null
    TRABAJADORA_SEXUAL: string | null
    POBLACION_LGTBI: string | null
    ORIENTACION_SEXUAL: string | null
    Barrio: string | null
    confirmacion_telefono: string | null
    poll: string | null
    Clave: string | null
    codPaisResidencia: string | null
    codMunicipioResidencia: string | null
    codDepartamentoResidencia: string | null
    codPaisOrigen: string | null
    codZonaTerritorialResidencia: string | null
    incapacidad: string | null
    Capitado: $Enums.usuarios_Capitado | null
    IdUsuario: number | null
    IdCentro: number | null
    vacunas_completas: string | null
    intervenciones_quirurgicas: string | null
    alergia: string | null
  }

  export type UsuariosCountAggregateOutputType = {
    Carnet: number
    codPrestador: number
    Identificaci_n_usuario: number
    Tipo_identificaci_n: number
    Primer_apellido: number
    Segundo_apellido: number
    Primer_nombre: number
    Segundo_nombre: number
    Direcci_n: number
    Tel_fono: number
    Tipo_usuario: number
    Tipo_afiliado: number
    C_digo_Ocupaci_n: number
    Unidad_edad: number
    Edad: number
    Sexo: number
    Residencia: number
    Zona_residencia: number
    cedula_afiliado: number
    Fecha_nacimient: number
    NHistoria: number
    Estado_civil: number
    Estado: number
    fecha_retiro: number
    Ciudad: number
    Sector: number
    Nombre_acudiente: number
    Telefono_acudiente: number
    Antecedente_Patologico1: number
    Antecedente_Patologico2: number
    Antecedente_Patologico3: number
    Antecedente_Quirurgico1: number
    Antecedente_Quirurgico2: number
    Antecedente_Familiar1: number
    Antecedente_Familiar2: number
    Antecedente_Familiar3: number
    Hemoclasificaci_n: number
    RH: number
    Fecha_afiliacion: number
    Parentezco: number
    Ciudad_cedula: number
    Escalafon_afiliado: number
    Discapacidad: number
    Estrato: number
    AL1: number
    AL2: number
    Cod_medico: number
    Codigo_eps: number
    Rango: number
    Pagos: number
    Cod_odontologo: number
    Fecha_novedad: number
    Contrato: number
    N_mero_afiliaci_n: number
    Etnico: number
    NumeroSemanasCotizadas: number
    LugarNacimiento: number
    NroHijos: number
    Escolaridad: number
    FechaAfiliacion: number
    Celular: number
    CorreoElectr_nico: number
    Responsable: number
    Telefono_Responsable: number
    Religion: number
    Telefono_Secundario: number
    email: number
    Fecha_Creado: number
    Creado_Por: number
    Fecha_Modificado: number
    Modificado_por: number
    Fecha_Estado: number
    Portabilidad: number
    Fecha_Portabilidad: number
    nombre_disp_asignado: number
    Genero: number
    Poblacion_Clave: number
    Gestacion: number
    Victima_del_Conflicto_armado: number
    VICTIMA_DEL_MALTRATO: number
    ABANDONO_SOCIAL: number
    DESESCOLARIZADO: number
    DESEMPLEADO: number
    CARCELARIO: number
    MIGRANTE: number
    TRABAJADORA_SEXUAL: number
    POBLACION_LGTBI: number
    ORIENTACION_SEXUAL: number
    Barrio: number
    confirmacion_telefono: number
    poll: number
    Clave: number
    codPaisResidencia: number
    codMunicipioResidencia: number
    codDepartamentoResidencia: number
    codPaisOrigen: number
    codZonaTerritorialResidencia: number
    incapacidad: number
    Capitado: number
    IdUsuario: number
    IdCentro: number
    vacunas_completas: number
    intervenciones_quirurgicas: number
    alergia: number
    _all: number
  }


  export type UsuariosAvgAggregateInputType = {
    AL1?: true
    AL2?: true
    NumeroSemanasCotizadas?: true
    NroHijos?: true
    IdUsuario?: true
    IdCentro?: true
  }

  export type UsuariosSumAggregateInputType = {
    AL1?: true
    AL2?: true
    NumeroSemanasCotizadas?: true
    NroHijos?: true
    IdUsuario?: true
    IdCentro?: true
  }

  export type UsuariosMinAggregateInputType = {
    Carnet?: true
    codPrestador?: true
    Identificaci_n_usuario?: true
    Tipo_identificaci_n?: true
    Primer_apellido?: true
    Segundo_apellido?: true
    Primer_nombre?: true
    Segundo_nombre?: true
    Direcci_n?: true
    Tel_fono?: true
    Tipo_usuario?: true
    Tipo_afiliado?: true
    C_digo_Ocupaci_n?: true
    Unidad_edad?: true
    Edad?: true
    Sexo?: true
    Residencia?: true
    Zona_residencia?: true
    cedula_afiliado?: true
    Fecha_nacimient?: true
    NHistoria?: true
    Estado_civil?: true
    Estado?: true
    fecha_retiro?: true
    Ciudad?: true
    Sector?: true
    Nombre_acudiente?: true
    Telefono_acudiente?: true
    Antecedente_Patologico1?: true
    Antecedente_Patologico2?: true
    Antecedente_Patologico3?: true
    Antecedente_Quirurgico1?: true
    Antecedente_Quirurgico2?: true
    Antecedente_Familiar1?: true
    Antecedente_Familiar2?: true
    Antecedente_Familiar3?: true
    Hemoclasificaci_n?: true
    RH?: true
    Fecha_afiliacion?: true
    Parentezco?: true
    Ciudad_cedula?: true
    Escalafon_afiliado?: true
    Discapacidad?: true
    Estrato?: true
    AL1?: true
    AL2?: true
    Cod_medico?: true
    Codigo_eps?: true
    Rango?: true
    Pagos?: true
    Cod_odontologo?: true
    Fecha_novedad?: true
    Contrato?: true
    N_mero_afiliaci_n?: true
    Etnico?: true
    NumeroSemanasCotizadas?: true
    LugarNacimiento?: true
    NroHijos?: true
    Escolaridad?: true
    FechaAfiliacion?: true
    Celular?: true
    CorreoElectr_nico?: true
    Responsable?: true
    Telefono_Responsable?: true
    Religion?: true
    Telefono_Secundario?: true
    email?: true
    Fecha_Creado?: true
    Creado_Por?: true
    Fecha_Modificado?: true
    Modificado_por?: true
    Fecha_Estado?: true
    Portabilidad?: true
    Fecha_Portabilidad?: true
    nombre_disp_asignado?: true
    Genero?: true
    Poblacion_Clave?: true
    Gestacion?: true
    Victima_del_Conflicto_armado?: true
    VICTIMA_DEL_MALTRATO?: true
    ABANDONO_SOCIAL?: true
    DESESCOLARIZADO?: true
    DESEMPLEADO?: true
    CARCELARIO?: true
    MIGRANTE?: true
    TRABAJADORA_SEXUAL?: true
    POBLACION_LGTBI?: true
    ORIENTACION_SEXUAL?: true
    Barrio?: true
    confirmacion_telefono?: true
    poll?: true
    Clave?: true
    codPaisResidencia?: true
    codMunicipioResidencia?: true
    codDepartamentoResidencia?: true
    codPaisOrigen?: true
    codZonaTerritorialResidencia?: true
    incapacidad?: true
    Capitado?: true
    IdUsuario?: true
    IdCentro?: true
    vacunas_completas?: true
    intervenciones_quirurgicas?: true
    alergia?: true
  }

  export type UsuariosMaxAggregateInputType = {
    Carnet?: true
    codPrestador?: true
    Identificaci_n_usuario?: true
    Tipo_identificaci_n?: true
    Primer_apellido?: true
    Segundo_apellido?: true
    Primer_nombre?: true
    Segundo_nombre?: true
    Direcci_n?: true
    Tel_fono?: true
    Tipo_usuario?: true
    Tipo_afiliado?: true
    C_digo_Ocupaci_n?: true
    Unidad_edad?: true
    Edad?: true
    Sexo?: true
    Residencia?: true
    Zona_residencia?: true
    cedula_afiliado?: true
    Fecha_nacimient?: true
    NHistoria?: true
    Estado_civil?: true
    Estado?: true
    fecha_retiro?: true
    Ciudad?: true
    Sector?: true
    Nombre_acudiente?: true
    Telefono_acudiente?: true
    Antecedente_Patologico1?: true
    Antecedente_Patologico2?: true
    Antecedente_Patologico3?: true
    Antecedente_Quirurgico1?: true
    Antecedente_Quirurgico2?: true
    Antecedente_Familiar1?: true
    Antecedente_Familiar2?: true
    Antecedente_Familiar3?: true
    Hemoclasificaci_n?: true
    RH?: true
    Fecha_afiliacion?: true
    Parentezco?: true
    Ciudad_cedula?: true
    Escalafon_afiliado?: true
    Discapacidad?: true
    Estrato?: true
    AL1?: true
    AL2?: true
    Cod_medico?: true
    Codigo_eps?: true
    Rango?: true
    Pagos?: true
    Cod_odontologo?: true
    Fecha_novedad?: true
    Contrato?: true
    N_mero_afiliaci_n?: true
    Etnico?: true
    NumeroSemanasCotizadas?: true
    LugarNacimiento?: true
    NroHijos?: true
    Escolaridad?: true
    FechaAfiliacion?: true
    Celular?: true
    CorreoElectr_nico?: true
    Responsable?: true
    Telefono_Responsable?: true
    Religion?: true
    Telefono_Secundario?: true
    email?: true
    Fecha_Creado?: true
    Creado_Por?: true
    Fecha_Modificado?: true
    Modificado_por?: true
    Fecha_Estado?: true
    Portabilidad?: true
    Fecha_Portabilidad?: true
    nombre_disp_asignado?: true
    Genero?: true
    Poblacion_Clave?: true
    Gestacion?: true
    Victima_del_Conflicto_armado?: true
    VICTIMA_DEL_MALTRATO?: true
    ABANDONO_SOCIAL?: true
    DESESCOLARIZADO?: true
    DESEMPLEADO?: true
    CARCELARIO?: true
    MIGRANTE?: true
    TRABAJADORA_SEXUAL?: true
    POBLACION_LGTBI?: true
    ORIENTACION_SEXUAL?: true
    Barrio?: true
    confirmacion_telefono?: true
    poll?: true
    Clave?: true
    codPaisResidencia?: true
    codMunicipioResidencia?: true
    codDepartamentoResidencia?: true
    codPaisOrigen?: true
    codZonaTerritorialResidencia?: true
    incapacidad?: true
    Capitado?: true
    IdUsuario?: true
    IdCentro?: true
    vacunas_completas?: true
    intervenciones_quirurgicas?: true
    alergia?: true
  }

  export type UsuariosCountAggregateInputType = {
    Carnet?: true
    codPrestador?: true
    Identificaci_n_usuario?: true
    Tipo_identificaci_n?: true
    Primer_apellido?: true
    Segundo_apellido?: true
    Primer_nombre?: true
    Segundo_nombre?: true
    Direcci_n?: true
    Tel_fono?: true
    Tipo_usuario?: true
    Tipo_afiliado?: true
    C_digo_Ocupaci_n?: true
    Unidad_edad?: true
    Edad?: true
    Sexo?: true
    Residencia?: true
    Zona_residencia?: true
    cedula_afiliado?: true
    Fecha_nacimient?: true
    NHistoria?: true
    Estado_civil?: true
    Estado?: true
    fecha_retiro?: true
    Ciudad?: true
    Sector?: true
    Nombre_acudiente?: true
    Telefono_acudiente?: true
    Antecedente_Patologico1?: true
    Antecedente_Patologico2?: true
    Antecedente_Patologico3?: true
    Antecedente_Quirurgico1?: true
    Antecedente_Quirurgico2?: true
    Antecedente_Familiar1?: true
    Antecedente_Familiar2?: true
    Antecedente_Familiar3?: true
    Hemoclasificaci_n?: true
    RH?: true
    Fecha_afiliacion?: true
    Parentezco?: true
    Ciudad_cedula?: true
    Escalafon_afiliado?: true
    Discapacidad?: true
    Estrato?: true
    AL1?: true
    AL2?: true
    Cod_medico?: true
    Codigo_eps?: true
    Rango?: true
    Pagos?: true
    Cod_odontologo?: true
    Fecha_novedad?: true
    Contrato?: true
    N_mero_afiliaci_n?: true
    Etnico?: true
    NumeroSemanasCotizadas?: true
    LugarNacimiento?: true
    NroHijos?: true
    Escolaridad?: true
    FechaAfiliacion?: true
    Celular?: true
    CorreoElectr_nico?: true
    Responsable?: true
    Telefono_Responsable?: true
    Religion?: true
    Telefono_Secundario?: true
    email?: true
    Fecha_Creado?: true
    Creado_Por?: true
    Fecha_Modificado?: true
    Modificado_por?: true
    Fecha_Estado?: true
    Portabilidad?: true
    Fecha_Portabilidad?: true
    nombre_disp_asignado?: true
    Genero?: true
    Poblacion_Clave?: true
    Gestacion?: true
    Victima_del_Conflicto_armado?: true
    VICTIMA_DEL_MALTRATO?: true
    ABANDONO_SOCIAL?: true
    DESESCOLARIZADO?: true
    DESEMPLEADO?: true
    CARCELARIO?: true
    MIGRANTE?: true
    TRABAJADORA_SEXUAL?: true
    POBLACION_LGTBI?: true
    ORIENTACION_SEXUAL?: true
    Barrio?: true
    confirmacion_telefono?: true
    poll?: true
    Clave?: true
    codPaisResidencia?: true
    codMunicipioResidencia?: true
    codDepartamentoResidencia?: true
    codPaisOrigen?: true
    codZonaTerritorialResidencia?: true
    incapacidad?: true
    Capitado?: true
    IdUsuario?: true
    IdCentro?: true
    vacunas_completas?: true
    intervenciones_quirurgicas?: true
    alergia?: true
    _all?: true
  }

  export type UsuariosAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which usuarios to aggregate.
     */
    where?: usuariosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of usuarios to fetch.
     */
    orderBy?: usuariosOrderByWithRelationInput | usuariosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: usuariosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned usuarios
    **/
    _count?: true | UsuariosCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UsuariosAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UsuariosSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsuariosMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsuariosMaxAggregateInputType
  }

  export type GetUsuariosAggregateType<T extends UsuariosAggregateArgs> = {
        [P in keyof T & keyof AggregateUsuarios]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsuarios[P]>
      : GetScalarType<T[P], AggregateUsuarios[P]>
  }




  export type usuariosGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: usuariosWhereInput
    orderBy?: usuariosOrderByWithAggregationInput | usuariosOrderByWithAggregationInput[]
    by: UsuariosScalarFieldEnum[] | UsuariosScalarFieldEnum
    having?: usuariosScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsuariosCountAggregateInputType | true
    _avg?: UsuariosAvgAggregateInputType
    _sum?: UsuariosSumAggregateInputType
    _min?: UsuariosMinAggregateInputType
    _max?: UsuariosMaxAggregateInputType
  }

  export type UsuariosGroupByOutputType = {
    Carnet: string
    codPrestador: string | null
    Identificaci_n_usuario: string
    Tipo_identificaci_n: string
    Primer_apellido: string
    Segundo_apellido: string | null
    Primer_nombre: string
    Segundo_nombre: string | null
    Direcci_n: string | null
    Tel_fono: string | null
    Tipo_usuario: string
    Tipo_afiliado: string | null
    C_digo_Ocupaci_n: string | null
    Unidad_edad: string
    Edad: string
    Sexo: string
    Residencia: string
    Zona_residencia: string
    cedula_afiliado: string | null
    Fecha_nacimient: Date | null
    NHistoria: string | null
    Estado_civil: string | null
    Estado: string | null
    fecha_retiro: Date | null
    Ciudad: string | null
    Sector: string
    Nombre_acudiente: string | null
    Telefono_acudiente: string | null
    Antecedente_Patologico1: string | null
    Antecedente_Patologico2: string | null
    Antecedente_Patologico3: string | null
    Antecedente_Quirurgico1: string | null
    Antecedente_Quirurgico2: string | null
    Antecedente_Familiar1: string | null
    Antecedente_Familiar2: string | null
    Antecedente_Familiar3: string | null
    Hemoclasificaci_n: string | null
    RH: string | null
    Fecha_afiliacion: Date | null
    Parentezco: string | null
    Ciudad_cedula: string | null
    Escalafon_afiliado: string | null
    Discapacidad: string | null
    Estrato: string | null
    AL1: number | null
    AL2: number | null
    Cod_medico: string | null
    Codigo_eps: string
    Rango: string | null
    Pagos: string | null
    Cod_odontologo: string | null
    Fecha_novedad: Date | null
    Contrato: string | null
    N_mero_afiliaci_n: string | null
    Etnico: string | null
    NumeroSemanasCotizadas: number | null
    LugarNacimiento: string | null
    NroHijos: number | null
    Escolaridad: string | null
    FechaAfiliacion: Date | null
    Celular: string | null
    CorreoElectr_nico: string | null
    Responsable: string | null
    Telefono_Responsable: string | null
    Religion: string | null
    Telefono_Secundario: string | null
    email: string | null
    Fecha_Creado: string | null
    Creado_Por: string | null
    Fecha_Modificado: string | null
    Modificado_por: string | null
    Fecha_Estado: string | null
    Portabilidad: string | null
    Fecha_Portabilidad: string | null
    nombre_disp_asignado: string | null
    Genero: string | null
    Poblacion_Clave: string | null
    Gestacion: string | null
    Victima_del_Conflicto_armado: string | null
    VICTIMA_DEL_MALTRATO: string | null
    ABANDONO_SOCIAL: string | null
    DESESCOLARIZADO: string | null
    DESEMPLEADO: string | null
    CARCELARIO: string | null
    MIGRANTE: string | null
    TRABAJADORA_SEXUAL: string | null
    POBLACION_LGTBI: string | null
    ORIENTACION_SEXUAL: string | null
    Barrio: string | null
    confirmacion_telefono: string | null
    poll: string | null
    Clave: string | null
    codPaisResidencia: string | null
    codMunicipioResidencia: string | null
    codDepartamentoResidencia: string | null
    codPaisOrigen: string | null
    codZonaTerritorialResidencia: string | null
    incapacidad: string | null
    Capitado: $Enums.usuarios_Capitado | null
    IdUsuario: number
    IdCentro: number | null
    vacunas_completas: string | null
    intervenciones_quirurgicas: string | null
    alergia: string | null
    _count: UsuariosCountAggregateOutputType | null
    _avg: UsuariosAvgAggregateOutputType | null
    _sum: UsuariosSumAggregateOutputType | null
    _min: UsuariosMinAggregateOutputType | null
    _max: UsuariosMaxAggregateOutputType | null
  }

  type GetUsuariosGroupByPayload<T extends usuariosGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsuariosGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsuariosGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsuariosGroupByOutputType[P]>
            : GetScalarType<T[P], UsuariosGroupByOutputType[P]>
        }
      >
    >


  export type usuariosSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Carnet?: boolean
    codPrestador?: boolean
    Identificaci_n_usuario?: boolean
    Tipo_identificaci_n?: boolean
    Primer_apellido?: boolean
    Segundo_apellido?: boolean
    Primer_nombre?: boolean
    Segundo_nombre?: boolean
    Direcci_n?: boolean
    Tel_fono?: boolean
    Tipo_usuario?: boolean
    Tipo_afiliado?: boolean
    C_digo_Ocupaci_n?: boolean
    Unidad_edad?: boolean
    Edad?: boolean
    Sexo?: boolean
    Residencia?: boolean
    Zona_residencia?: boolean
    cedula_afiliado?: boolean
    Fecha_nacimient?: boolean
    NHistoria?: boolean
    Estado_civil?: boolean
    Estado?: boolean
    fecha_retiro?: boolean
    Ciudad?: boolean
    Sector?: boolean
    Nombre_acudiente?: boolean
    Telefono_acudiente?: boolean
    Antecedente_Patologico1?: boolean
    Antecedente_Patologico2?: boolean
    Antecedente_Patologico3?: boolean
    Antecedente_Quirurgico1?: boolean
    Antecedente_Quirurgico2?: boolean
    Antecedente_Familiar1?: boolean
    Antecedente_Familiar2?: boolean
    Antecedente_Familiar3?: boolean
    Hemoclasificaci_n?: boolean
    RH?: boolean
    Fecha_afiliacion?: boolean
    Parentezco?: boolean
    Ciudad_cedula?: boolean
    Escalafon_afiliado?: boolean
    Discapacidad?: boolean
    Estrato?: boolean
    AL1?: boolean
    AL2?: boolean
    Cod_medico?: boolean
    Codigo_eps?: boolean
    Rango?: boolean
    Pagos?: boolean
    Cod_odontologo?: boolean
    Fecha_novedad?: boolean
    Contrato?: boolean
    N_mero_afiliaci_n?: boolean
    Etnico?: boolean
    NumeroSemanasCotizadas?: boolean
    LugarNacimiento?: boolean
    NroHijos?: boolean
    Escolaridad?: boolean
    FechaAfiliacion?: boolean
    Celular?: boolean
    CorreoElectr_nico?: boolean
    Responsable?: boolean
    Telefono_Responsable?: boolean
    Religion?: boolean
    Telefono_Secundario?: boolean
    email?: boolean
    Fecha_Creado?: boolean
    Creado_Por?: boolean
    Fecha_Modificado?: boolean
    Modificado_por?: boolean
    Fecha_Estado?: boolean
    Portabilidad?: boolean
    Fecha_Portabilidad?: boolean
    nombre_disp_asignado?: boolean
    Genero?: boolean
    Poblacion_Clave?: boolean
    Gestacion?: boolean
    Victima_del_Conflicto_armado?: boolean
    VICTIMA_DEL_MALTRATO?: boolean
    ABANDONO_SOCIAL?: boolean
    DESESCOLARIZADO?: boolean
    DESEMPLEADO?: boolean
    CARCELARIO?: boolean
    MIGRANTE?: boolean
    TRABAJADORA_SEXUAL?: boolean
    POBLACION_LGTBI?: boolean
    ORIENTACION_SEXUAL?: boolean
    Barrio?: boolean
    confirmacion_telefono?: boolean
    poll?: boolean
    Clave?: boolean
    codPaisResidencia?: boolean
    codMunicipioResidencia?: boolean
    codDepartamentoResidencia?: boolean
    codPaisOrigen?: boolean
    codZonaTerritorialResidencia?: boolean
    incapacidad?: boolean
    Capitado?: boolean
    IdUsuario?: boolean
    IdCentro?: boolean
    vacunas_completas?: boolean
    intervenciones_quirurgicas?: boolean
    alergia?: boolean
  }, ExtArgs["result"]["usuarios"]>



  export type usuariosSelectScalar = {
    Carnet?: boolean
    codPrestador?: boolean
    Identificaci_n_usuario?: boolean
    Tipo_identificaci_n?: boolean
    Primer_apellido?: boolean
    Segundo_apellido?: boolean
    Primer_nombre?: boolean
    Segundo_nombre?: boolean
    Direcci_n?: boolean
    Tel_fono?: boolean
    Tipo_usuario?: boolean
    Tipo_afiliado?: boolean
    C_digo_Ocupaci_n?: boolean
    Unidad_edad?: boolean
    Edad?: boolean
    Sexo?: boolean
    Residencia?: boolean
    Zona_residencia?: boolean
    cedula_afiliado?: boolean
    Fecha_nacimient?: boolean
    NHistoria?: boolean
    Estado_civil?: boolean
    Estado?: boolean
    fecha_retiro?: boolean
    Ciudad?: boolean
    Sector?: boolean
    Nombre_acudiente?: boolean
    Telefono_acudiente?: boolean
    Antecedente_Patologico1?: boolean
    Antecedente_Patologico2?: boolean
    Antecedente_Patologico3?: boolean
    Antecedente_Quirurgico1?: boolean
    Antecedente_Quirurgico2?: boolean
    Antecedente_Familiar1?: boolean
    Antecedente_Familiar2?: boolean
    Antecedente_Familiar3?: boolean
    Hemoclasificaci_n?: boolean
    RH?: boolean
    Fecha_afiliacion?: boolean
    Parentezco?: boolean
    Ciudad_cedula?: boolean
    Escalafon_afiliado?: boolean
    Discapacidad?: boolean
    Estrato?: boolean
    AL1?: boolean
    AL2?: boolean
    Cod_medico?: boolean
    Codigo_eps?: boolean
    Rango?: boolean
    Pagos?: boolean
    Cod_odontologo?: boolean
    Fecha_novedad?: boolean
    Contrato?: boolean
    N_mero_afiliaci_n?: boolean
    Etnico?: boolean
    NumeroSemanasCotizadas?: boolean
    LugarNacimiento?: boolean
    NroHijos?: boolean
    Escolaridad?: boolean
    FechaAfiliacion?: boolean
    Celular?: boolean
    CorreoElectr_nico?: boolean
    Responsable?: boolean
    Telefono_Responsable?: boolean
    Religion?: boolean
    Telefono_Secundario?: boolean
    email?: boolean
    Fecha_Creado?: boolean
    Creado_Por?: boolean
    Fecha_Modificado?: boolean
    Modificado_por?: boolean
    Fecha_Estado?: boolean
    Portabilidad?: boolean
    Fecha_Portabilidad?: boolean
    nombre_disp_asignado?: boolean
    Genero?: boolean
    Poblacion_Clave?: boolean
    Gestacion?: boolean
    Victima_del_Conflicto_armado?: boolean
    VICTIMA_DEL_MALTRATO?: boolean
    ABANDONO_SOCIAL?: boolean
    DESESCOLARIZADO?: boolean
    DESEMPLEADO?: boolean
    CARCELARIO?: boolean
    MIGRANTE?: boolean
    TRABAJADORA_SEXUAL?: boolean
    POBLACION_LGTBI?: boolean
    ORIENTACION_SEXUAL?: boolean
    Barrio?: boolean
    confirmacion_telefono?: boolean
    poll?: boolean
    Clave?: boolean
    codPaisResidencia?: boolean
    codMunicipioResidencia?: boolean
    codDepartamentoResidencia?: boolean
    codPaisOrigen?: boolean
    codZonaTerritorialResidencia?: boolean
    incapacidad?: boolean
    Capitado?: boolean
    IdUsuario?: boolean
    IdCentro?: boolean
    vacunas_completas?: boolean
    intervenciones_quirurgicas?: boolean
    alergia?: boolean
  }

  export type usuariosOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Carnet" | "codPrestador" | "Identificaci_n_usuario" | "Tipo_identificaci_n" | "Primer_apellido" | "Segundo_apellido" | "Primer_nombre" | "Segundo_nombre" | "Direcci_n" | "Tel_fono" | "Tipo_usuario" | "Tipo_afiliado" | "C_digo_Ocupaci_n" | "Unidad_edad" | "Edad" | "Sexo" | "Residencia" | "Zona_residencia" | "cedula_afiliado" | "Fecha_nacimient" | "NHistoria" | "Estado_civil" | "Estado" | "fecha_retiro" | "Ciudad" | "Sector" | "Nombre_acudiente" | "Telefono_acudiente" | "Antecedente_Patologico1" | "Antecedente_Patologico2" | "Antecedente_Patologico3" | "Antecedente_Quirurgico1" | "Antecedente_Quirurgico2" | "Antecedente_Familiar1" | "Antecedente_Familiar2" | "Antecedente_Familiar3" | "Hemoclasificaci_n" | "RH" | "Fecha_afiliacion" | "Parentezco" | "Ciudad_cedula" | "Escalafon_afiliado" | "Discapacidad" | "Estrato" | "AL1" | "AL2" | "Cod_medico" | "Codigo_eps" | "Rango" | "Pagos" | "Cod_odontologo" | "Fecha_novedad" | "Contrato" | "N_mero_afiliaci_n" | "Etnico" | "NumeroSemanasCotizadas" | "LugarNacimiento" | "NroHijos" | "Escolaridad" | "FechaAfiliacion" | "Celular" | "CorreoElectr_nico" | "Responsable" | "Telefono_Responsable" | "Religion" | "Telefono_Secundario" | "email" | "Fecha_Creado" | "Creado_Por" | "Fecha_Modificado" | "Modificado_por" | "Fecha_Estado" | "Portabilidad" | "Fecha_Portabilidad" | "nombre_disp_asignado" | "Genero" | "Poblacion_Clave" | "Gestacion" | "Victima_del_Conflicto_armado" | "VICTIMA_DEL_MALTRATO" | "ABANDONO_SOCIAL" | "DESESCOLARIZADO" | "DESEMPLEADO" | "CARCELARIO" | "MIGRANTE" | "TRABAJADORA_SEXUAL" | "POBLACION_LGTBI" | "ORIENTACION_SEXUAL" | "Barrio" | "confirmacion_telefono" | "poll" | "Clave" | "codPaisResidencia" | "codMunicipioResidencia" | "codDepartamentoResidencia" | "codPaisOrigen" | "codZonaTerritorialResidencia" | "incapacidad" | "Capitado" | "IdUsuario" | "IdCentro" | "vacunas_completas" | "intervenciones_quirurgicas" | "alergia", ExtArgs["result"]["usuarios"]>

  export type $usuariosPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "usuarios"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Carnet: string
      codPrestador: string | null
      Identificaci_n_usuario: string
      Tipo_identificaci_n: string
      Primer_apellido: string
      Segundo_apellido: string | null
      Primer_nombre: string
      Segundo_nombre: string | null
      Direcci_n: string | null
      Tel_fono: string | null
      Tipo_usuario: string
      Tipo_afiliado: string | null
      C_digo_Ocupaci_n: string | null
      Unidad_edad: string
      Edad: string
      Sexo: string
      Residencia: string
      Zona_residencia: string
      cedula_afiliado: string | null
      Fecha_nacimient: Date | null
      NHistoria: string | null
      Estado_civil: string | null
      Estado: string | null
      fecha_retiro: Date | null
      Ciudad: string | null
      Sector: string
      Nombre_acudiente: string | null
      Telefono_acudiente: string | null
      Antecedente_Patologico1: string | null
      Antecedente_Patologico2: string | null
      Antecedente_Patologico3: string | null
      Antecedente_Quirurgico1: string | null
      Antecedente_Quirurgico2: string | null
      Antecedente_Familiar1: string | null
      Antecedente_Familiar2: string | null
      Antecedente_Familiar3: string | null
      Hemoclasificaci_n: string | null
      RH: string | null
      Fecha_afiliacion: Date | null
      Parentezco: string | null
      Ciudad_cedula: string | null
      Escalafon_afiliado: string | null
      Discapacidad: string | null
      Estrato: string | null
      AL1: number | null
      AL2: number | null
      Cod_medico: string | null
      Codigo_eps: string
      Rango: string | null
      Pagos: string | null
      Cod_odontologo: string | null
      Fecha_novedad: Date | null
      Contrato: string | null
      N_mero_afiliaci_n: string | null
      Etnico: string | null
      NumeroSemanasCotizadas: number | null
      LugarNacimiento: string | null
      NroHijos: number | null
      Escolaridad: string | null
      FechaAfiliacion: Date | null
      Celular: string | null
      CorreoElectr_nico: string | null
      Responsable: string | null
      Telefono_Responsable: string | null
      Religion: string | null
      Telefono_Secundario: string | null
      email: string | null
      Fecha_Creado: string | null
      Creado_Por: string | null
      Fecha_Modificado: string | null
      Modificado_por: string | null
      Fecha_Estado: string | null
      Portabilidad: string | null
      Fecha_Portabilidad: string | null
      nombre_disp_asignado: string | null
      Genero: string | null
      Poblacion_Clave: string | null
      Gestacion: string | null
      Victima_del_Conflicto_armado: string | null
      VICTIMA_DEL_MALTRATO: string | null
      ABANDONO_SOCIAL: string | null
      DESESCOLARIZADO: string | null
      DESEMPLEADO: string | null
      CARCELARIO: string | null
      MIGRANTE: string | null
      TRABAJADORA_SEXUAL: string | null
      POBLACION_LGTBI: string | null
      ORIENTACION_SEXUAL: string | null
      Barrio: string | null
      confirmacion_telefono: string | null
      poll: string | null
      Clave: string | null
      codPaisResidencia: string | null
      codMunicipioResidencia: string | null
      codDepartamentoResidencia: string | null
      codPaisOrigen: string | null
      codZonaTerritorialResidencia: string | null
      incapacidad: string | null
      Capitado: $Enums.usuarios_Capitado | null
      IdUsuario: number
      IdCentro: number | null
      vacunas_completas: string | null
      intervenciones_quirurgicas: string | null
      alergia: string | null
    }, ExtArgs["result"]["usuarios"]>
    composites: {}
  }

  type usuariosGetPayload<S extends boolean | null | undefined | usuariosDefaultArgs> = $Result.GetResult<Prisma.$usuariosPayload, S>

  type usuariosCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<usuariosFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsuariosCountAggregateInputType | true
    }

  export interface usuariosDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['usuarios'], meta: { name: 'usuarios' } }
    /**
     * Find zero or one Usuarios that matches the filter.
     * @param {usuariosFindUniqueArgs} args - Arguments to find a Usuarios
     * @example
     * // Get one Usuarios
     * const usuarios = await prisma.usuarios.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends usuariosFindUniqueArgs>(args: SelectSubset<T, usuariosFindUniqueArgs<ExtArgs>>): Prisma__usuariosClient<$Result.GetResult<Prisma.$usuariosPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Usuarios that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {usuariosFindUniqueOrThrowArgs} args - Arguments to find a Usuarios
     * @example
     * // Get one Usuarios
     * const usuarios = await prisma.usuarios.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends usuariosFindUniqueOrThrowArgs>(args: SelectSubset<T, usuariosFindUniqueOrThrowArgs<ExtArgs>>): Prisma__usuariosClient<$Result.GetResult<Prisma.$usuariosPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Usuarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usuariosFindFirstArgs} args - Arguments to find a Usuarios
     * @example
     * // Get one Usuarios
     * const usuarios = await prisma.usuarios.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends usuariosFindFirstArgs>(args?: SelectSubset<T, usuariosFindFirstArgs<ExtArgs>>): Prisma__usuariosClient<$Result.GetResult<Prisma.$usuariosPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Usuarios that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usuariosFindFirstOrThrowArgs} args - Arguments to find a Usuarios
     * @example
     * // Get one Usuarios
     * const usuarios = await prisma.usuarios.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends usuariosFindFirstOrThrowArgs>(args?: SelectSubset<T, usuariosFindFirstOrThrowArgs<ExtArgs>>): Prisma__usuariosClient<$Result.GetResult<Prisma.$usuariosPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Usuarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usuariosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Usuarios
     * const usuarios = await prisma.usuarios.findMany()
     * 
     * // Get first 10 Usuarios
     * const usuarios = await prisma.usuarios.findMany({ take: 10 })
     * 
     * // Only select the `Carnet`
     * const usuariosWithCarnetOnly = await prisma.usuarios.findMany({ select: { Carnet: true } })
     * 
     */
    findMany<T extends usuariosFindManyArgs>(args?: SelectSubset<T, usuariosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usuariosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Usuarios.
     * @param {usuariosCreateArgs} args - Arguments to create a Usuarios.
     * @example
     * // Create one Usuarios
     * const Usuarios = await prisma.usuarios.create({
     *   data: {
     *     // ... data to create a Usuarios
     *   }
     * })
     * 
     */
    create<T extends usuariosCreateArgs>(args: SelectSubset<T, usuariosCreateArgs<ExtArgs>>): Prisma__usuariosClient<$Result.GetResult<Prisma.$usuariosPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Usuarios.
     * @param {usuariosCreateManyArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuarios = await prisma.usuarios.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends usuariosCreateManyArgs>(args?: SelectSubset<T, usuariosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Usuarios.
     * @param {usuariosDeleteArgs} args - Arguments to delete one Usuarios.
     * @example
     * // Delete one Usuarios
     * const Usuarios = await prisma.usuarios.delete({
     *   where: {
     *     // ... filter to delete one Usuarios
     *   }
     * })
     * 
     */
    delete<T extends usuariosDeleteArgs>(args: SelectSubset<T, usuariosDeleteArgs<ExtArgs>>): Prisma__usuariosClient<$Result.GetResult<Prisma.$usuariosPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Usuarios.
     * @param {usuariosUpdateArgs} args - Arguments to update one Usuarios.
     * @example
     * // Update one Usuarios
     * const usuarios = await prisma.usuarios.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends usuariosUpdateArgs>(args: SelectSubset<T, usuariosUpdateArgs<ExtArgs>>): Prisma__usuariosClient<$Result.GetResult<Prisma.$usuariosPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Usuarios.
     * @param {usuariosDeleteManyArgs} args - Arguments to filter Usuarios to delete.
     * @example
     * // Delete a few Usuarios
     * const { count } = await prisma.usuarios.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends usuariosDeleteManyArgs>(args?: SelectSubset<T, usuariosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usuariosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Usuarios
     * const usuarios = await prisma.usuarios.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends usuariosUpdateManyArgs>(args: SelectSubset<T, usuariosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Usuarios.
     * @param {usuariosUpsertArgs} args - Arguments to update or create a Usuarios.
     * @example
     * // Update or create a Usuarios
     * const usuarios = await prisma.usuarios.upsert({
     *   create: {
     *     // ... data to create a Usuarios
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Usuarios we want to update
     *   }
     * })
     */
    upsert<T extends usuariosUpsertArgs>(args: SelectSubset<T, usuariosUpsertArgs<ExtArgs>>): Prisma__usuariosClient<$Result.GetResult<Prisma.$usuariosPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usuariosCountArgs} args - Arguments to filter Usuarios to count.
     * @example
     * // Count the number of Usuarios
     * const count = await prisma.usuarios.count({
     *   where: {
     *     // ... the filter for the Usuarios we want to count
     *   }
     * })
    **/
    count<T extends usuariosCountArgs>(
      args?: Subset<T, usuariosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsuariosCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuariosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UsuariosAggregateArgs>(args: Subset<T, UsuariosAggregateArgs>): Prisma.PrismaPromise<GetUsuariosAggregateType<T>>

    /**
     * Group by Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usuariosGroupByArgs} args - Group by arguments.
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
      T extends usuariosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: usuariosGroupByArgs['orderBy'] }
        : { orderBy?: usuariosGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, usuariosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsuariosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the usuarios model
   */
  readonly fields: usuariosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for usuarios.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__usuariosClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the usuarios model
   */
  interface usuariosFieldRefs {
    readonly Carnet: FieldRef<"usuarios", 'String'>
    readonly codPrestador: FieldRef<"usuarios", 'String'>
    readonly Identificaci_n_usuario: FieldRef<"usuarios", 'String'>
    readonly Tipo_identificaci_n: FieldRef<"usuarios", 'String'>
    readonly Primer_apellido: FieldRef<"usuarios", 'String'>
    readonly Segundo_apellido: FieldRef<"usuarios", 'String'>
    readonly Primer_nombre: FieldRef<"usuarios", 'String'>
    readonly Segundo_nombre: FieldRef<"usuarios", 'String'>
    readonly Direcci_n: FieldRef<"usuarios", 'String'>
    readonly Tel_fono: FieldRef<"usuarios", 'String'>
    readonly Tipo_usuario: FieldRef<"usuarios", 'String'>
    readonly Tipo_afiliado: FieldRef<"usuarios", 'String'>
    readonly C_digo_Ocupaci_n: FieldRef<"usuarios", 'String'>
    readonly Unidad_edad: FieldRef<"usuarios", 'String'>
    readonly Edad: FieldRef<"usuarios", 'String'>
    readonly Sexo: FieldRef<"usuarios", 'String'>
    readonly Residencia: FieldRef<"usuarios", 'String'>
    readonly Zona_residencia: FieldRef<"usuarios", 'String'>
    readonly cedula_afiliado: FieldRef<"usuarios", 'String'>
    readonly Fecha_nacimient: FieldRef<"usuarios", 'DateTime'>
    readonly NHistoria: FieldRef<"usuarios", 'String'>
    readonly Estado_civil: FieldRef<"usuarios", 'String'>
    readonly Estado: FieldRef<"usuarios", 'String'>
    readonly fecha_retiro: FieldRef<"usuarios", 'DateTime'>
    readonly Ciudad: FieldRef<"usuarios", 'String'>
    readonly Sector: FieldRef<"usuarios", 'String'>
    readonly Nombre_acudiente: FieldRef<"usuarios", 'String'>
    readonly Telefono_acudiente: FieldRef<"usuarios", 'String'>
    readonly Antecedente_Patologico1: FieldRef<"usuarios", 'String'>
    readonly Antecedente_Patologico2: FieldRef<"usuarios", 'String'>
    readonly Antecedente_Patologico3: FieldRef<"usuarios", 'String'>
    readonly Antecedente_Quirurgico1: FieldRef<"usuarios", 'String'>
    readonly Antecedente_Quirurgico2: FieldRef<"usuarios", 'String'>
    readonly Antecedente_Familiar1: FieldRef<"usuarios", 'String'>
    readonly Antecedente_Familiar2: FieldRef<"usuarios", 'String'>
    readonly Antecedente_Familiar3: FieldRef<"usuarios", 'String'>
    readonly Hemoclasificaci_n: FieldRef<"usuarios", 'String'>
    readonly RH: FieldRef<"usuarios", 'String'>
    readonly Fecha_afiliacion: FieldRef<"usuarios", 'DateTime'>
    readonly Parentezco: FieldRef<"usuarios", 'String'>
    readonly Ciudad_cedula: FieldRef<"usuarios", 'String'>
    readonly Escalafon_afiliado: FieldRef<"usuarios", 'String'>
    readonly Discapacidad: FieldRef<"usuarios", 'String'>
    readonly Estrato: FieldRef<"usuarios", 'String'>
    readonly AL1: FieldRef<"usuarios", 'Int'>
    readonly AL2: FieldRef<"usuarios", 'Int'>
    readonly Cod_medico: FieldRef<"usuarios", 'String'>
    readonly Codigo_eps: FieldRef<"usuarios", 'String'>
    readonly Rango: FieldRef<"usuarios", 'String'>
    readonly Pagos: FieldRef<"usuarios", 'String'>
    readonly Cod_odontologo: FieldRef<"usuarios", 'String'>
    readonly Fecha_novedad: FieldRef<"usuarios", 'DateTime'>
    readonly Contrato: FieldRef<"usuarios", 'String'>
    readonly N_mero_afiliaci_n: FieldRef<"usuarios", 'String'>
    readonly Etnico: FieldRef<"usuarios", 'String'>
    readonly NumeroSemanasCotizadas: FieldRef<"usuarios", 'Int'>
    readonly LugarNacimiento: FieldRef<"usuarios", 'String'>
    readonly NroHijos: FieldRef<"usuarios", 'Int'>
    readonly Escolaridad: FieldRef<"usuarios", 'String'>
    readonly FechaAfiliacion: FieldRef<"usuarios", 'DateTime'>
    readonly Celular: FieldRef<"usuarios", 'String'>
    readonly CorreoElectr_nico: FieldRef<"usuarios", 'String'>
    readonly Responsable: FieldRef<"usuarios", 'String'>
    readonly Telefono_Responsable: FieldRef<"usuarios", 'String'>
    readonly Religion: FieldRef<"usuarios", 'String'>
    readonly Telefono_Secundario: FieldRef<"usuarios", 'String'>
    readonly email: FieldRef<"usuarios", 'String'>
    readonly Fecha_Creado: FieldRef<"usuarios", 'String'>
    readonly Creado_Por: FieldRef<"usuarios", 'String'>
    readonly Fecha_Modificado: FieldRef<"usuarios", 'String'>
    readonly Modificado_por: FieldRef<"usuarios", 'String'>
    readonly Fecha_Estado: FieldRef<"usuarios", 'String'>
    readonly Portabilidad: FieldRef<"usuarios", 'String'>
    readonly Fecha_Portabilidad: FieldRef<"usuarios", 'String'>
    readonly nombre_disp_asignado: FieldRef<"usuarios", 'String'>
    readonly Genero: FieldRef<"usuarios", 'String'>
    readonly Poblacion_Clave: FieldRef<"usuarios", 'String'>
    readonly Gestacion: FieldRef<"usuarios", 'String'>
    readonly Victima_del_Conflicto_armado: FieldRef<"usuarios", 'String'>
    readonly VICTIMA_DEL_MALTRATO: FieldRef<"usuarios", 'String'>
    readonly ABANDONO_SOCIAL: FieldRef<"usuarios", 'String'>
    readonly DESESCOLARIZADO: FieldRef<"usuarios", 'String'>
    readonly DESEMPLEADO: FieldRef<"usuarios", 'String'>
    readonly CARCELARIO: FieldRef<"usuarios", 'String'>
    readonly MIGRANTE: FieldRef<"usuarios", 'String'>
    readonly TRABAJADORA_SEXUAL: FieldRef<"usuarios", 'String'>
    readonly POBLACION_LGTBI: FieldRef<"usuarios", 'String'>
    readonly ORIENTACION_SEXUAL: FieldRef<"usuarios", 'String'>
    readonly Barrio: FieldRef<"usuarios", 'String'>
    readonly confirmacion_telefono: FieldRef<"usuarios", 'String'>
    readonly poll: FieldRef<"usuarios", 'String'>
    readonly Clave: FieldRef<"usuarios", 'String'>
    readonly codPaisResidencia: FieldRef<"usuarios", 'String'>
    readonly codMunicipioResidencia: FieldRef<"usuarios", 'String'>
    readonly codDepartamentoResidencia: FieldRef<"usuarios", 'String'>
    readonly codPaisOrigen: FieldRef<"usuarios", 'String'>
    readonly codZonaTerritorialResidencia: FieldRef<"usuarios", 'String'>
    readonly incapacidad: FieldRef<"usuarios", 'String'>
    readonly Capitado: FieldRef<"usuarios", 'usuarios_Capitado'>
    readonly IdUsuario: FieldRef<"usuarios", 'Int'>
    readonly IdCentro: FieldRef<"usuarios", 'Int'>
    readonly vacunas_completas: FieldRef<"usuarios", 'String'>
    readonly intervenciones_quirurgicas: FieldRef<"usuarios", 'String'>
    readonly alergia: FieldRef<"usuarios", 'String'>
  }
    

  // Custom InputTypes
  /**
   * usuarios findUnique
   */
  export type usuariosFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuarios
     */
    select?: usuariosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuarios
     */
    omit?: usuariosOmit<ExtArgs> | null
    /**
     * Filter, which usuarios to fetch.
     */
    where: usuariosWhereUniqueInput
  }

  /**
   * usuarios findUniqueOrThrow
   */
  export type usuariosFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuarios
     */
    select?: usuariosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuarios
     */
    omit?: usuariosOmit<ExtArgs> | null
    /**
     * Filter, which usuarios to fetch.
     */
    where: usuariosWhereUniqueInput
  }

  /**
   * usuarios findFirst
   */
  export type usuariosFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuarios
     */
    select?: usuariosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuarios
     */
    omit?: usuariosOmit<ExtArgs> | null
    /**
     * Filter, which usuarios to fetch.
     */
    where?: usuariosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of usuarios to fetch.
     */
    orderBy?: usuariosOrderByWithRelationInput | usuariosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for usuarios.
     */
    cursor?: usuariosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of usuarios.
     */
    distinct?: UsuariosScalarFieldEnum | UsuariosScalarFieldEnum[]
  }

  /**
   * usuarios findFirstOrThrow
   */
  export type usuariosFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuarios
     */
    select?: usuariosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuarios
     */
    omit?: usuariosOmit<ExtArgs> | null
    /**
     * Filter, which usuarios to fetch.
     */
    where?: usuariosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of usuarios to fetch.
     */
    orderBy?: usuariosOrderByWithRelationInput | usuariosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for usuarios.
     */
    cursor?: usuariosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of usuarios.
     */
    distinct?: UsuariosScalarFieldEnum | UsuariosScalarFieldEnum[]
  }

  /**
   * usuarios findMany
   */
  export type usuariosFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuarios
     */
    select?: usuariosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuarios
     */
    omit?: usuariosOmit<ExtArgs> | null
    /**
     * Filter, which usuarios to fetch.
     */
    where?: usuariosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of usuarios to fetch.
     */
    orderBy?: usuariosOrderByWithRelationInput | usuariosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing usuarios.
     */
    cursor?: usuariosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` usuarios.
     */
    skip?: number
    distinct?: UsuariosScalarFieldEnum | UsuariosScalarFieldEnum[]
  }

  /**
   * usuarios create
   */
  export type usuariosCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuarios
     */
    select?: usuariosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuarios
     */
    omit?: usuariosOmit<ExtArgs> | null
    /**
     * The data needed to create a usuarios.
     */
    data: XOR<usuariosCreateInput, usuariosUncheckedCreateInput>
  }

  /**
   * usuarios createMany
   */
  export type usuariosCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many usuarios.
     */
    data: usuariosCreateManyInput | usuariosCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * usuarios update
   */
  export type usuariosUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuarios
     */
    select?: usuariosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuarios
     */
    omit?: usuariosOmit<ExtArgs> | null
    /**
     * The data needed to update a usuarios.
     */
    data: XOR<usuariosUpdateInput, usuariosUncheckedUpdateInput>
    /**
     * Choose, which usuarios to update.
     */
    where: usuariosWhereUniqueInput
  }

  /**
   * usuarios updateMany
   */
  export type usuariosUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update usuarios.
     */
    data: XOR<usuariosUpdateManyMutationInput, usuariosUncheckedUpdateManyInput>
    /**
     * Filter which usuarios to update
     */
    where?: usuariosWhereInput
    /**
     * Limit how many usuarios to update.
     */
    limit?: number
  }

  /**
   * usuarios upsert
   */
  export type usuariosUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuarios
     */
    select?: usuariosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuarios
     */
    omit?: usuariosOmit<ExtArgs> | null
    /**
     * The filter to search for the usuarios to update in case it exists.
     */
    where: usuariosWhereUniqueInput
    /**
     * In case the usuarios found by the `where` argument doesn't exist, create a new usuarios with this data.
     */
    create: XOR<usuariosCreateInput, usuariosUncheckedCreateInput>
    /**
     * In case the usuarios was found with the provided `where` argument, update it with this data.
     */
    update: XOR<usuariosUpdateInput, usuariosUncheckedUpdateInput>
  }

  /**
   * usuarios delete
   */
  export type usuariosDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuarios
     */
    select?: usuariosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuarios
     */
    omit?: usuariosOmit<ExtArgs> | null
    /**
     * Filter which usuarios to delete.
     */
    where: usuariosWhereUniqueInput
  }

  /**
   * usuarios deleteMany
   */
  export type usuariosDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which usuarios to delete
     */
    where?: usuariosWhereInput
    /**
     * Limit how many usuarios to delete.
     */
    limit?: number
  }

  /**
   * usuarios without action
   */
  export type usuariosDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuarios
     */
    select?: usuariosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuarios
     */
    omit?: usuariosOmit<ExtArgs> | null
  }


  /**
   * Model empleados
   */

  export type AggregateEmpleados = {
    _count: EmpleadosCountAggregateOutputType | null
    _avg: EmpleadosAvgAggregateOutputType | null
    _sum: EmpleadosSumAggregateOutputType | null
    _min: EmpleadosMinAggregateOutputType | null
    _max: EmpleadosMaxAggregateOutputType | null
  }

  export type EmpleadosAvgAggregateOutputType = {
    Perfil: number | null
    Perfil2: number | null
    IdCentro: number | null
  }

  export type EmpleadosSumAggregateOutputType = {
    Perfil: number | null
    Perfil2: number | null
    IdCentro: number | null
  }

  export type EmpleadosMinAggregateOutputType = {
    C_digo_empleado: string | null
    Nombre_empleado: string | null
    Direcci_n: string | null
    Tel_fonos: string | null
    Medico: boolean | null
    EsMedico: boolean | null
    Odontologo: boolean | null
    Clave: string | null
    Estado_Empleado: boolean | null
    POtraEsp: boolean | null
    Registro_medico: string | null
    De: string | null
    Firma: string | null
    Registra: boolean | null
    enfermeria: boolean | null
    Perfil: number | null
    Perfil2: number | null
    phone: string | null
    Firmaimg: Uint8Array | null
    consultorio: string | null
    email: string | null
    IdCentro: number | null
    userpic: Uint8Array | null
    TipoDocumento: string | null
    Documento: string | null
  }

  export type EmpleadosMaxAggregateOutputType = {
    C_digo_empleado: string | null
    Nombre_empleado: string | null
    Direcci_n: string | null
    Tel_fonos: string | null
    Medico: boolean | null
    EsMedico: boolean | null
    Odontologo: boolean | null
    Clave: string | null
    Estado_Empleado: boolean | null
    POtraEsp: boolean | null
    Registro_medico: string | null
    De: string | null
    Firma: string | null
    Registra: boolean | null
    enfermeria: boolean | null
    Perfil: number | null
    Perfil2: number | null
    phone: string | null
    Firmaimg: Uint8Array | null
    consultorio: string | null
    email: string | null
    IdCentro: number | null
    userpic: Uint8Array | null
    TipoDocumento: string | null
    Documento: string | null
  }

  export type EmpleadosCountAggregateOutputType = {
    C_digo_empleado: number
    Nombre_empleado: number
    Direcci_n: number
    Tel_fonos: number
    Medico: number
    EsMedico: number
    Odontologo: number
    Clave: number
    Estado_Empleado: number
    POtraEsp: number
    Registro_medico: number
    De: number
    Firma: number
    Registra: number
    enfermeria: number
    Perfil: number
    Perfil2: number
    phone: number
    Firmaimg: number
    consultorio: number
    email: number
    IdCentro: number
    userpic: number
    TipoDocumento: number
    Documento: number
    _all: number
  }


  export type EmpleadosAvgAggregateInputType = {
    Perfil?: true
    Perfil2?: true
    IdCentro?: true
  }

  export type EmpleadosSumAggregateInputType = {
    Perfil?: true
    Perfil2?: true
    IdCentro?: true
  }

  export type EmpleadosMinAggregateInputType = {
    C_digo_empleado?: true
    Nombre_empleado?: true
    Direcci_n?: true
    Tel_fonos?: true
    Medico?: true
    EsMedico?: true
    Odontologo?: true
    Clave?: true
    Estado_Empleado?: true
    POtraEsp?: true
    Registro_medico?: true
    De?: true
    Firma?: true
    Registra?: true
    enfermeria?: true
    Perfil?: true
    Perfil2?: true
    phone?: true
    Firmaimg?: true
    consultorio?: true
    email?: true
    IdCentro?: true
    userpic?: true
    TipoDocumento?: true
    Documento?: true
  }

  export type EmpleadosMaxAggregateInputType = {
    C_digo_empleado?: true
    Nombre_empleado?: true
    Direcci_n?: true
    Tel_fonos?: true
    Medico?: true
    EsMedico?: true
    Odontologo?: true
    Clave?: true
    Estado_Empleado?: true
    POtraEsp?: true
    Registro_medico?: true
    De?: true
    Firma?: true
    Registra?: true
    enfermeria?: true
    Perfil?: true
    Perfil2?: true
    phone?: true
    Firmaimg?: true
    consultorio?: true
    email?: true
    IdCentro?: true
    userpic?: true
    TipoDocumento?: true
    Documento?: true
  }

  export type EmpleadosCountAggregateInputType = {
    C_digo_empleado?: true
    Nombre_empleado?: true
    Direcci_n?: true
    Tel_fonos?: true
    Medico?: true
    EsMedico?: true
    Odontologo?: true
    Clave?: true
    Estado_Empleado?: true
    POtraEsp?: true
    Registro_medico?: true
    De?: true
    Firma?: true
    Registra?: true
    enfermeria?: true
    Perfil?: true
    Perfil2?: true
    phone?: true
    Firmaimg?: true
    consultorio?: true
    email?: true
    IdCentro?: true
    userpic?: true
    TipoDocumento?: true
    Documento?: true
    _all?: true
  }

  export type EmpleadosAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which empleados to aggregate.
     */
    where?: empleadosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of empleados to fetch.
     */
    orderBy?: empleadosOrderByWithRelationInput | empleadosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: empleadosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` empleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned empleados
    **/
    _count?: true | EmpleadosCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EmpleadosAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EmpleadosSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmpleadosMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmpleadosMaxAggregateInputType
  }

  export type GetEmpleadosAggregateType<T extends EmpleadosAggregateArgs> = {
        [P in keyof T & keyof AggregateEmpleados]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmpleados[P]>
      : GetScalarType<T[P], AggregateEmpleados[P]>
  }




  export type empleadosGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: empleadosWhereInput
    orderBy?: empleadosOrderByWithAggregationInput | empleadosOrderByWithAggregationInput[]
    by: EmpleadosScalarFieldEnum[] | EmpleadosScalarFieldEnum
    having?: empleadosScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmpleadosCountAggregateInputType | true
    _avg?: EmpleadosAvgAggregateInputType
    _sum?: EmpleadosSumAggregateInputType
    _min?: EmpleadosMinAggregateInputType
    _max?: EmpleadosMaxAggregateInputType
  }

  export type EmpleadosGroupByOutputType = {
    C_digo_empleado: string
    Nombre_empleado: string
    Direcci_n: string | null
    Tel_fonos: string | null
    Medico: boolean | null
    EsMedico: boolean
    Odontologo: boolean | null
    Clave: string | null
    Estado_Empleado: boolean | null
    POtraEsp: boolean | null
    Registro_medico: string | null
    De: string | null
    Firma: string | null
    Registra: boolean | null
    enfermeria: boolean | null
    Perfil: number | null
    Perfil2: number | null
    phone: string | null
    Firmaimg: Uint8Array
    consultorio: string | null
    email: string | null
    IdCentro: number | null
    userpic: Uint8Array | null
    TipoDocumento: string | null
    Documento: string | null
    _count: EmpleadosCountAggregateOutputType | null
    _avg: EmpleadosAvgAggregateOutputType | null
    _sum: EmpleadosSumAggregateOutputType | null
    _min: EmpleadosMinAggregateOutputType | null
    _max: EmpleadosMaxAggregateOutputType | null
  }

  type GetEmpleadosGroupByPayload<T extends empleadosGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmpleadosGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmpleadosGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmpleadosGroupByOutputType[P]>
            : GetScalarType<T[P], EmpleadosGroupByOutputType[P]>
        }
      >
    >


  export type empleadosSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    C_digo_empleado?: boolean
    Nombre_empleado?: boolean
    Direcci_n?: boolean
    Tel_fonos?: boolean
    Medico?: boolean
    EsMedico?: boolean
    Odontologo?: boolean
    Clave?: boolean
    Estado_Empleado?: boolean
    POtraEsp?: boolean
    Registro_medico?: boolean
    De?: boolean
    Firma?: boolean
    Registra?: boolean
    enfermeria?: boolean
    Perfil?: boolean
    Perfil2?: boolean
    phone?: boolean
    Firmaimg?: boolean
    consultorio?: boolean
    email?: boolean
    IdCentro?: boolean
    userpic?: boolean
    TipoDocumento?: boolean
    Documento?: boolean
  }, ExtArgs["result"]["empleados"]>



  export type empleadosSelectScalar = {
    C_digo_empleado?: boolean
    Nombre_empleado?: boolean
    Direcci_n?: boolean
    Tel_fonos?: boolean
    Medico?: boolean
    EsMedico?: boolean
    Odontologo?: boolean
    Clave?: boolean
    Estado_Empleado?: boolean
    POtraEsp?: boolean
    Registro_medico?: boolean
    De?: boolean
    Firma?: boolean
    Registra?: boolean
    enfermeria?: boolean
    Perfil?: boolean
    Perfil2?: boolean
    phone?: boolean
    Firmaimg?: boolean
    consultorio?: boolean
    email?: boolean
    IdCentro?: boolean
    userpic?: boolean
    TipoDocumento?: boolean
    Documento?: boolean
  }

  export type empleadosOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"C_digo_empleado" | "Nombre_empleado" | "Direcci_n" | "Tel_fonos" | "Medico" | "EsMedico" | "Odontologo" | "Clave" | "Estado_Empleado" | "POtraEsp" | "Registro_medico" | "De" | "Firma" | "Registra" | "enfermeria" | "Perfil" | "Perfil2" | "phone" | "Firmaimg" | "consultorio" | "email" | "IdCentro" | "userpic" | "TipoDocumento" | "Documento", ExtArgs["result"]["empleados"]>

  export type $empleadosPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "empleados"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      C_digo_empleado: string
      Nombre_empleado: string
      Direcci_n: string | null
      Tel_fonos: string | null
      Medico: boolean | null
      EsMedico: boolean
      Odontologo: boolean | null
      Clave: string | null
      Estado_Empleado: boolean | null
      POtraEsp: boolean | null
      Registro_medico: string | null
      De: string | null
      Firma: string | null
      Registra: boolean | null
      enfermeria: boolean | null
      Perfil: number | null
      Perfil2: number | null
      phone: string | null
      Firmaimg: Uint8Array
      consultorio: string | null
      email: string | null
      IdCentro: number | null
      userpic: Uint8Array | null
      TipoDocumento: string | null
      Documento: string | null
    }, ExtArgs["result"]["empleados"]>
    composites: {}
  }

  type empleadosGetPayload<S extends boolean | null | undefined | empleadosDefaultArgs> = $Result.GetResult<Prisma.$empleadosPayload, S>

  type empleadosCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<empleadosFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EmpleadosCountAggregateInputType | true
    }

  export interface empleadosDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['empleados'], meta: { name: 'empleados' } }
    /**
     * Find zero or one Empleados that matches the filter.
     * @param {empleadosFindUniqueArgs} args - Arguments to find a Empleados
     * @example
     * // Get one Empleados
     * const empleados = await prisma.empleados.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends empleadosFindUniqueArgs>(args: SelectSubset<T, empleadosFindUniqueArgs<ExtArgs>>): Prisma__empleadosClient<$Result.GetResult<Prisma.$empleadosPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Empleados that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {empleadosFindUniqueOrThrowArgs} args - Arguments to find a Empleados
     * @example
     * // Get one Empleados
     * const empleados = await prisma.empleados.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends empleadosFindUniqueOrThrowArgs>(args: SelectSubset<T, empleadosFindUniqueOrThrowArgs<ExtArgs>>): Prisma__empleadosClient<$Result.GetResult<Prisma.$empleadosPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Empleados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {empleadosFindFirstArgs} args - Arguments to find a Empleados
     * @example
     * // Get one Empleados
     * const empleados = await prisma.empleados.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends empleadosFindFirstArgs>(args?: SelectSubset<T, empleadosFindFirstArgs<ExtArgs>>): Prisma__empleadosClient<$Result.GetResult<Prisma.$empleadosPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Empleados that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {empleadosFindFirstOrThrowArgs} args - Arguments to find a Empleados
     * @example
     * // Get one Empleados
     * const empleados = await prisma.empleados.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends empleadosFindFirstOrThrowArgs>(args?: SelectSubset<T, empleadosFindFirstOrThrowArgs<ExtArgs>>): Prisma__empleadosClient<$Result.GetResult<Prisma.$empleadosPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Empleados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {empleadosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Empleados
     * const empleados = await prisma.empleados.findMany()
     * 
     * // Get first 10 Empleados
     * const empleados = await prisma.empleados.findMany({ take: 10 })
     * 
     * // Only select the `C_digo_empleado`
     * const empleadosWithC_digo_empleadoOnly = await prisma.empleados.findMany({ select: { C_digo_empleado: true } })
     * 
     */
    findMany<T extends empleadosFindManyArgs>(args?: SelectSubset<T, empleadosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$empleadosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Empleados.
     * @param {empleadosCreateArgs} args - Arguments to create a Empleados.
     * @example
     * // Create one Empleados
     * const Empleados = await prisma.empleados.create({
     *   data: {
     *     // ... data to create a Empleados
     *   }
     * })
     * 
     */
    create<T extends empleadosCreateArgs>(args: SelectSubset<T, empleadosCreateArgs<ExtArgs>>): Prisma__empleadosClient<$Result.GetResult<Prisma.$empleadosPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Empleados.
     * @param {empleadosCreateManyArgs} args - Arguments to create many Empleados.
     * @example
     * // Create many Empleados
     * const empleados = await prisma.empleados.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends empleadosCreateManyArgs>(args?: SelectSubset<T, empleadosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Empleados.
     * @param {empleadosDeleteArgs} args - Arguments to delete one Empleados.
     * @example
     * // Delete one Empleados
     * const Empleados = await prisma.empleados.delete({
     *   where: {
     *     // ... filter to delete one Empleados
     *   }
     * })
     * 
     */
    delete<T extends empleadosDeleteArgs>(args: SelectSubset<T, empleadosDeleteArgs<ExtArgs>>): Prisma__empleadosClient<$Result.GetResult<Prisma.$empleadosPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Empleados.
     * @param {empleadosUpdateArgs} args - Arguments to update one Empleados.
     * @example
     * // Update one Empleados
     * const empleados = await prisma.empleados.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends empleadosUpdateArgs>(args: SelectSubset<T, empleadosUpdateArgs<ExtArgs>>): Prisma__empleadosClient<$Result.GetResult<Prisma.$empleadosPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Empleados.
     * @param {empleadosDeleteManyArgs} args - Arguments to filter Empleados to delete.
     * @example
     * // Delete a few Empleados
     * const { count } = await prisma.empleados.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends empleadosDeleteManyArgs>(args?: SelectSubset<T, empleadosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Empleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {empleadosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Empleados
     * const empleados = await prisma.empleados.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends empleadosUpdateManyArgs>(args: SelectSubset<T, empleadosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Empleados.
     * @param {empleadosUpsertArgs} args - Arguments to update or create a Empleados.
     * @example
     * // Update or create a Empleados
     * const empleados = await prisma.empleados.upsert({
     *   create: {
     *     // ... data to create a Empleados
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Empleados we want to update
     *   }
     * })
     */
    upsert<T extends empleadosUpsertArgs>(args: SelectSubset<T, empleadosUpsertArgs<ExtArgs>>): Prisma__empleadosClient<$Result.GetResult<Prisma.$empleadosPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Empleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {empleadosCountArgs} args - Arguments to filter Empleados to count.
     * @example
     * // Count the number of Empleados
     * const count = await prisma.empleados.count({
     *   where: {
     *     // ... the filter for the Empleados we want to count
     *   }
     * })
    **/
    count<T extends empleadosCountArgs>(
      args?: Subset<T, empleadosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmpleadosCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Empleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EmpleadosAggregateArgs>(args: Subset<T, EmpleadosAggregateArgs>): Prisma.PrismaPromise<GetEmpleadosAggregateType<T>>

    /**
     * Group by Empleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {empleadosGroupByArgs} args - Group by arguments.
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
      T extends empleadosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: empleadosGroupByArgs['orderBy'] }
        : { orderBy?: empleadosGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, empleadosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmpleadosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the empleados model
   */
  readonly fields: empleadosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for empleados.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__empleadosClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the empleados model
   */
  interface empleadosFieldRefs {
    readonly C_digo_empleado: FieldRef<"empleados", 'String'>
    readonly Nombre_empleado: FieldRef<"empleados", 'String'>
    readonly Direcci_n: FieldRef<"empleados", 'String'>
    readonly Tel_fonos: FieldRef<"empleados", 'String'>
    readonly Medico: FieldRef<"empleados", 'Boolean'>
    readonly EsMedico: FieldRef<"empleados", 'Boolean'>
    readonly Odontologo: FieldRef<"empleados", 'Boolean'>
    readonly Clave: FieldRef<"empleados", 'String'>
    readonly Estado_Empleado: FieldRef<"empleados", 'Boolean'>
    readonly POtraEsp: FieldRef<"empleados", 'Boolean'>
    readonly Registro_medico: FieldRef<"empleados", 'String'>
    readonly De: FieldRef<"empleados", 'String'>
    readonly Firma: FieldRef<"empleados", 'String'>
    readonly Registra: FieldRef<"empleados", 'Boolean'>
    readonly enfermeria: FieldRef<"empleados", 'Boolean'>
    readonly Perfil: FieldRef<"empleados", 'Int'>
    readonly Perfil2: FieldRef<"empleados", 'Int'>
    readonly phone: FieldRef<"empleados", 'String'>
    readonly Firmaimg: FieldRef<"empleados", 'Bytes'>
    readonly consultorio: FieldRef<"empleados", 'String'>
    readonly email: FieldRef<"empleados", 'String'>
    readonly IdCentro: FieldRef<"empleados", 'Int'>
    readonly userpic: FieldRef<"empleados", 'Bytes'>
    readonly TipoDocumento: FieldRef<"empleados", 'String'>
    readonly Documento: FieldRef<"empleados", 'String'>
  }
    

  // Custom InputTypes
  /**
   * empleados findUnique
   */
  export type empleadosFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the empleados
     */
    select?: empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the empleados
     */
    omit?: empleadosOmit<ExtArgs> | null
    /**
     * Filter, which empleados to fetch.
     */
    where: empleadosWhereUniqueInput
  }

  /**
   * empleados findUniqueOrThrow
   */
  export type empleadosFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the empleados
     */
    select?: empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the empleados
     */
    omit?: empleadosOmit<ExtArgs> | null
    /**
     * Filter, which empleados to fetch.
     */
    where: empleadosWhereUniqueInput
  }

  /**
   * empleados findFirst
   */
  export type empleadosFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the empleados
     */
    select?: empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the empleados
     */
    omit?: empleadosOmit<ExtArgs> | null
    /**
     * Filter, which empleados to fetch.
     */
    where?: empleadosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of empleados to fetch.
     */
    orderBy?: empleadosOrderByWithRelationInput | empleadosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for empleados.
     */
    cursor?: empleadosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` empleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of empleados.
     */
    distinct?: EmpleadosScalarFieldEnum | EmpleadosScalarFieldEnum[]
  }

  /**
   * empleados findFirstOrThrow
   */
  export type empleadosFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the empleados
     */
    select?: empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the empleados
     */
    omit?: empleadosOmit<ExtArgs> | null
    /**
     * Filter, which empleados to fetch.
     */
    where?: empleadosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of empleados to fetch.
     */
    orderBy?: empleadosOrderByWithRelationInput | empleadosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for empleados.
     */
    cursor?: empleadosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` empleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of empleados.
     */
    distinct?: EmpleadosScalarFieldEnum | EmpleadosScalarFieldEnum[]
  }

  /**
   * empleados findMany
   */
  export type empleadosFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the empleados
     */
    select?: empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the empleados
     */
    omit?: empleadosOmit<ExtArgs> | null
    /**
     * Filter, which empleados to fetch.
     */
    where?: empleadosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of empleados to fetch.
     */
    orderBy?: empleadosOrderByWithRelationInput | empleadosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing empleados.
     */
    cursor?: empleadosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` empleados.
     */
    skip?: number
    distinct?: EmpleadosScalarFieldEnum | EmpleadosScalarFieldEnum[]
  }

  /**
   * empleados create
   */
  export type empleadosCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the empleados
     */
    select?: empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the empleados
     */
    omit?: empleadosOmit<ExtArgs> | null
    /**
     * The data needed to create a empleados.
     */
    data: XOR<empleadosCreateInput, empleadosUncheckedCreateInput>
  }

  /**
   * empleados createMany
   */
  export type empleadosCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many empleados.
     */
    data: empleadosCreateManyInput | empleadosCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * empleados update
   */
  export type empleadosUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the empleados
     */
    select?: empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the empleados
     */
    omit?: empleadosOmit<ExtArgs> | null
    /**
     * The data needed to update a empleados.
     */
    data: XOR<empleadosUpdateInput, empleadosUncheckedUpdateInput>
    /**
     * Choose, which empleados to update.
     */
    where: empleadosWhereUniqueInput
  }

  /**
   * empleados updateMany
   */
  export type empleadosUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update empleados.
     */
    data: XOR<empleadosUpdateManyMutationInput, empleadosUncheckedUpdateManyInput>
    /**
     * Filter which empleados to update
     */
    where?: empleadosWhereInput
    /**
     * Limit how many empleados to update.
     */
    limit?: number
  }

  /**
   * empleados upsert
   */
  export type empleadosUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the empleados
     */
    select?: empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the empleados
     */
    omit?: empleadosOmit<ExtArgs> | null
    /**
     * The filter to search for the empleados to update in case it exists.
     */
    where: empleadosWhereUniqueInput
    /**
     * In case the empleados found by the `where` argument doesn't exist, create a new empleados with this data.
     */
    create: XOR<empleadosCreateInput, empleadosUncheckedCreateInput>
    /**
     * In case the empleados was found with the provided `where` argument, update it with this data.
     */
    update: XOR<empleadosUpdateInput, empleadosUncheckedUpdateInput>
  }

  /**
   * empleados delete
   */
  export type empleadosDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the empleados
     */
    select?: empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the empleados
     */
    omit?: empleadosOmit<ExtArgs> | null
    /**
     * Filter which empleados to delete.
     */
    where: empleadosWhereUniqueInput
  }

  /**
   * empleados deleteMany
   */
  export type empleadosDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which empleados to delete
     */
    where?: empleadosWhereInput
    /**
     * Limit how many empleados to delete.
     */
    limit?: number
  }

  /**
   * empleados without action
   */
  export type empleadosDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the empleados
     */
    select?: empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the empleados
     */
    omit?: empleadosOmit<ExtArgs> | null
  }


  /**
   * Model especialidad_empleados
   */

  export type AggregateEspecialidad_empleados = {
    _count: Especialidad_empleadosCountAggregateOutputType | null
    _avg: Especialidad_empleadosAvgAggregateOutputType | null
    _sum: Especialidad_empleadosSumAggregateOutputType | null
    _min: Especialidad_empleadosMinAggregateOutputType | null
    _max: Especialidad_empleadosMaxAggregateOutputType | null
  }

  export type Especialidad_empleadosAvgAggregateOutputType = {
    Consecutivo: number | null
    IdCentro: number | null
    MinutosXConsulta: number | null
    NoPacientes: number | null
    IdSede: number | null
  }

  export type Especialidad_empleadosSumAggregateOutputType = {
    Consecutivo: number | null
    IdCentro: number | null
    MinutosXConsulta: number | null
    NoPacientes: number | null
    IdSede: number | null
  }

  export type Especialidad_empleadosMinAggregateOutputType = {
    Consecutivo: number | null
    C_digo_empleado: string | null
    C_digo_especialidad: string | null
    IdCentro: number | null
    Principal: boolean | null
    Cups: string | null
    regimen_atencion: string | null
    MinutosXConsulta: number | null
    NoPacientes: number | null
    fecha_final: Date | null
    fecha_inicial: Date | null
    hf_m: string | null
    hf_t: string | null
    hi_m: string | null
    hi_t: string | null
    IdSede: number | null
    bot: string | null
    contrato: string | null
  }

  export type Especialidad_empleadosMaxAggregateOutputType = {
    Consecutivo: number | null
    C_digo_empleado: string | null
    C_digo_especialidad: string | null
    IdCentro: number | null
    Principal: boolean | null
    Cups: string | null
    regimen_atencion: string | null
    MinutosXConsulta: number | null
    NoPacientes: number | null
    fecha_final: Date | null
    fecha_inicial: Date | null
    hf_m: string | null
    hf_t: string | null
    hi_m: string | null
    hi_t: string | null
    IdSede: number | null
    bot: string | null
    contrato: string | null
  }

  export type Especialidad_empleadosCountAggregateOutputType = {
    Consecutivo: number
    C_digo_empleado: number
    C_digo_especialidad: number
    IdCentro: number
    Principal: number
    Cups: number
    regimen_atencion: number
    MinutosXConsulta: number
    NoPacientes: number
    fecha_final: number
    fecha_inicial: number
    hf_m: number
    hf_t: number
    hi_m: number
    hi_t: number
    IdSede: number
    bot: number
    contrato: number
    _all: number
  }


  export type Especialidad_empleadosAvgAggregateInputType = {
    Consecutivo?: true
    IdCentro?: true
    MinutosXConsulta?: true
    NoPacientes?: true
    IdSede?: true
  }

  export type Especialidad_empleadosSumAggregateInputType = {
    Consecutivo?: true
    IdCentro?: true
    MinutosXConsulta?: true
    NoPacientes?: true
    IdSede?: true
  }

  export type Especialidad_empleadosMinAggregateInputType = {
    Consecutivo?: true
    C_digo_empleado?: true
    C_digo_especialidad?: true
    IdCentro?: true
    Principal?: true
    Cups?: true
    regimen_atencion?: true
    MinutosXConsulta?: true
    NoPacientes?: true
    fecha_final?: true
    fecha_inicial?: true
    hf_m?: true
    hf_t?: true
    hi_m?: true
    hi_t?: true
    IdSede?: true
    bot?: true
    contrato?: true
  }

  export type Especialidad_empleadosMaxAggregateInputType = {
    Consecutivo?: true
    C_digo_empleado?: true
    C_digo_especialidad?: true
    IdCentro?: true
    Principal?: true
    Cups?: true
    regimen_atencion?: true
    MinutosXConsulta?: true
    NoPacientes?: true
    fecha_final?: true
    fecha_inicial?: true
    hf_m?: true
    hf_t?: true
    hi_m?: true
    hi_t?: true
    IdSede?: true
    bot?: true
    contrato?: true
  }

  export type Especialidad_empleadosCountAggregateInputType = {
    Consecutivo?: true
    C_digo_empleado?: true
    C_digo_especialidad?: true
    IdCentro?: true
    Principal?: true
    Cups?: true
    regimen_atencion?: true
    MinutosXConsulta?: true
    NoPacientes?: true
    fecha_final?: true
    fecha_inicial?: true
    hf_m?: true
    hf_t?: true
    hi_m?: true
    hi_t?: true
    IdSede?: true
    bot?: true
    contrato?: true
    _all?: true
  }

  export type Especialidad_empleadosAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which especialidad_empleados to aggregate.
     */
    where?: especialidad_empleadosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of especialidad_empleados to fetch.
     */
    orderBy?: especialidad_empleadosOrderByWithRelationInput | especialidad_empleadosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: especialidad_empleadosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` especialidad_empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` especialidad_empleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned especialidad_empleados
    **/
    _count?: true | Especialidad_empleadosCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Especialidad_empleadosAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Especialidad_empleadosSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Especialidad_empleadosMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Especialidad_empleadosMaxAggregateInputType
  }

  export type GetEspecialidad_empleadosAggregateType<T extends Especialidad_empleadosAggregateArgs> = {
        [P in keyof T & keyof AggregateEspecialidad_empleados]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEspecialidad_empleados[P]>
      : GetScalarType<T[P], AggregateEspecialidad_empleados[P]>
  }




  export type especialidad_empleadosGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: especialidad_empleadosWhereInput
    orderBy?: especialidad_empleadosOrderByWithAggregationInput | especialidad_empleadosOrderByWithAggregationInput[]
    by: Especialidad_empleadosScalarFieldEnum[] | Especialidad_empleadosScalarFieldEnum
    having?: especialidad_empleadosScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Especialidad_empleadosCountAggregateInputType | true
    _avg?: Especialidad_empleadosAvgAggregateInputType
    _sum?: Especialidad_empleadosSumAggregateInputType
    _min?: Especialidad_empleadosMinAggregateInputType
    _max?: Especialidad_empleadosMaxAggregateInputType
  }

  export type Especialidad_empleadosGroupByOutputType = {
    Consecutivo: number
    C_digo_empleado: string
    C_digo_especialidad: string
    IdCentro: number
    Principal: boolean | null
    Cups: string | null
    regimen_atencion: string | null
    MinutosXConsulta: number | null
    NoPacientes: number | null
    fecha_final: Date | null
    fecha_inicial: Date | null
    hf_m: string | null
    hf_t: string | null
    hi_m: string | null
    hi_t: string | null
    IdSede: number | null
    bot: string | null
    contrato: string | null
    _count: Especialidad_empleadosCountAggregateOutputType | null
    _avg: Especialidad_empleadosAvgAggregateOutputType | null
    _sum: Especialidad_empleadosSumAggregateOutputType | null
    _min: Especialidad_empleadosMinAggregateOutputType | null
    _max: Especialidad_empleadosMaxAggregateOutputType | null
  }

  type GetEspecialidad_empleadosGroupByPayload<T extends especialidad_empleadosGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Especialidad_empleadosGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Especialidad_empleadosGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Especialidad_empleadosGroupByOutputType[P]>
            : GetScalarType<T[P], Especialidad_empleadosGroupByOutputType[P]>
        }
      >
    >


  export type especialidad_empleadosSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Consecutivo?: boolean
    C_digo_empleado?: boolean
    C_digo_especialidad?: boolean
    IdCentro?: boolean
    Principal?: boolean
    Cups?: boolean
    regimen_atencion?: boolean
    MinutosXConsulta?: boolean
    NoPacientes?: boolean
    fecha_final?: boolean
    fecha_inicial?: boolean
    hf_m?: boolean
    hf_t?: boolean
    hi_m?: boolean
    hi_t?: boolean
    IdSede?: boolean
    bot?: boolean
    contrato?: boolean
  }, ExtArgs["result"]["especialidad_empleados"]>



  export type especialidad_empleadosSelectScalar = {
    Consecutivo?: boolean
    C_digo_empleado?: boolean
    C_digo_especialidad?: boolean
    IdCentro?: boolean
    Principal?: boolean
    Cups?: boolean
    regimen_atencion?: boolean
    MinutosXConsulta?: boolean
    NoPacientes?: boolean
    fecha_final?: boolean
    fecha_inicial?: boolean
    hf_m?: boolean
    hf_t?: boolean
    hi_m?: boolean
    hi_t?: boolean
    IdSede?: boolean
    bot?: boolean
    contrato?: boolean
  }

  export type especialidad_empleadosOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Consecutivo" | "C_digo_empleado" | "C_digo_especialidad" | "IdCentro" | "Principal" | "Cups" | "regimen_atencion" | "MinutosXConsulta" | "NoPacientes" | "fecha_final" | "fecha_inicial" | "hf_m" | "hf_t" | "hi_m" | "hi_t" | "IdSede" | "bot" | "contrato", ExtArgs["result"]["especialidad_empleados"]>

  export type $especialidad_empleadosPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "especialidad_empleados"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Consecutivo: number
      C_digo_empleado: string
      C_digo_especialidad: string
      IdCentro: number
      Principal: boolean | null
      Cups: string | null
      regimen_atencion: string | null
      MinutosXConsulta: number | null
      NoPacientes: number | null
      fecha_final: Date | null
      fecha_inicial: Date | null
      hf_m: string | null
      hf_t: string | null
      hi_m: string | null
      hi_t: string | null
      IdSede: number | null
      bot: string | null
      contrato: string | null
    }, ExtArgs["result"]["especialidad_empleados"]>
    composites: {}
  }

  type especialidad_empleadosGetPayload<S extends boolean | null | undefined | especialidad_empleadosDefaultArgs> = $Result.GetResult<Prisma.$especialidad_empleadosPayload, S>

  type especialidad_empleadosCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<especialidad_empleadosFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Especialidad_empleadosCountAggregateInputType | true
    }

  export interface especialidad_empleadosDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['especialidad_empleados'], meta: { name: 'especialidad_empleados' } }
    /**
     * Find zero or one Especialidad_empleados that matches the filter.
     * @param {especialidad_empleadosFindUniqueArgs} args - Arguments to find a Especialidad_empleados
     * @example
     * // Get one Especialidad_empleados
     * const especialidad_empleados = await prisma.especialidad_empleados.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends especialidad_empleadosFindUniqueArgs>(args: SelectSubset<T, especialidad_empleadosFindUniqueArgs<ExtArgs>>): Prisma__especialidad_empleadosClient<$Result.GetResult<Prisma.$especialidad_empleadosPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Especialidad_empleados that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {especialidad_empleadosFindUniqueOrThrowArgs} args - Arguments to find a Especialidad_empleados
     * @example
     * // Get one Especialidad_empleados
     * const especialidad_empleados = await prisma.especialidad_empleados.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends especialidad_empleadosFindUniqueOrThrowArgs>(args: SelectSubset<T, especialidad_empleadosFindUniqueOrThrowArgs<ExtArgs>>): Prisma__especialidad_empleadosClient<$Result.GetResult<Prisma.$especialidad_empleadosPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Especialidad_empleados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {especialidad_empleadosFindFirstArgs} args - Arguments to find a Especialidad_empleados
     * @example
     * // Get one Especialidad_empleados
     * const especialidad_empleados = await prisma.especialidad_empleados.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends especialidad_empleadosFindFirstArgs>(args?: SelectSubset<T, especialidad_empleadosFindFirstArgs<ExtArgs>>): Prisma__especialidad_empleadosClient<$Result.GetResult<Prisma.$especialidad_empleadosPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Especialidad_empleados that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {especialidad_empleadosFindFirstOrThrowArgs} args - Arguments to find a Especialidad_empleados
     * @example
     * // Get one Especialidad_empleados
     * const especialidad_empleados = await prisma.especialidad_empleados.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends especialidad_empleadosFindFirstOrThrowArgs>(args?: SelectSubset<T, especialidad_empleadosFindFirstOrThrowArgs<ExtArgs>>): Prisma__especialidad_empleadosClient<$Result.GetResult<Prisma.$especialidad_empleadosPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Especialidad_empleados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {especialidad_empleadosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Especialidad_empleados
     * const especialidad_empleados = await prisma.especialidad_empleados.findMany()
     * 
     * // Get first 10 Especialidad_empleados
     * const especialidad_empleados = await prisma.especialidad_empleados.findMany({ take: 10 })
     * 
     * // Only select the `Consecutivo`
     * const especialidad_empleadosWithConsecutivoOnly = await prisma.especialidad_empleados.findMany({ select: { Consecutivo: true } })
     * 
     */
    findMany<T extends especialidad_empleadosFindManyArgs>(args?: SelectSubset<T, especialidad_empleadosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$especialidad_empleadosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Especialidad_empleados.
     * @param {especialidad_empleadosCreateArgs} args - Arguments to create a Especialidad_empleados.
     * @example
     * // Create one Especialidad_empleados
     * const Especialidad_empleados = await prisma.especialidad_empleados.create({
     *   data: {
     *     // ... data to create a Especialidad_empleados
     *   }
     * })
     * 
     */
    create<T extends especialidad_empleadosCreateArgs>(args: SelectSubset<T, especialidad_empleadosCreateArgs<ExtArgs>>): Prisma__especialidad_empleadosClient<$Result.GetResult<Prisma.$especialidad_empleadosPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Especialidad_empleados.
     * @param {especialidad_empleadosCreateManyArgs} args - Arguments to create many Especialidad_empleados.
     * @example
     * // Create many Especialidad_empleados
     * const especialidad_empleados = await prisma.especialidad_empleados.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends especialidad_empleadosCreateManyArgs>(args?: SelectSubset<T, especialidad_empleadosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Especialidad_empleados.
     * @param {especialidad_empleadosDeleteArgs} args - Arguments to delete one Especialidad_empleados.
     * @example
     * // Delete one Especialidad_empleados
     * const Especialidad_empleados = await prisma.especialidad_empleados.delete({
     *   where: {
     *     // ... filter to delete one Especialidad_empleados
     *   }
     * })
     * 
     */
    delete<T extends especialidad_empleadosDeleteArgs>(args: SelectSubset<T, especialidad_empleadosDeleteArgs<ExtArgs>>): Prisma__especialidad_empleadosClient<$Result.GetResult<Prisma.$especialidad_empleadosPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Especialidad_empleados.
     * @param {especialidad_empleadosUpdateArgs} args - Arguments to update one Especialidad_empleados.
     * @example
     * // Update one Especialidad_empleados
     * const especialidad_empleados = await prisma.especialidad_empleados.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends especialidad_empleadosUpdateArgs>(args: SelectSubset<T, especialidad_empleadosUpdateArgs<ExtArgs>>): Prisma__especialidad_empleadosClient<$Result.GetResult<Prisma.$especialidad_empleadosPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Especialidad_empleados.
     * @param {especialidad_empleadosDeleteManyArgs} args - Arguments to filter Especialidad_empleados to delete.
     * @example
     * // Delete a few Especialidad_empleados
     * const { count } = await prisma.especialidad_empleados.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends especialidad_empleadosDeleteManyArgs>(args?: SelectSubset<T, especialidad_empleadosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Especialidad_empleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {especialidad_empleadosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Especialidad_empleados
     * const especialidad_empleados = await prisma.especialidad_empleados.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends especialidad_empleadosUpdateManyArgs>(args: SelectSubset<T, especialidad_empleadosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Especialidad_empleados.
     * @param {especialidad_empleadosUpsertArgs} args - Arguments to update or create a Especialidad_empleados.
     * @example
     * // Update or create a Especialidad_empleados
     * const especialidad_empleados = await prisma.especialidad_empleados.upsert({
     *   create: {
     *     // ... data to create a Especialidad_empleados
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Especialidad_empleados we want to update
     *   }
     * })
     */
    upsert<T extends especialidad_empleadosUpsertArgs>(args: SelectSubset<T, especialidad_empleadosUpsertArgs<ExtArgs>>): Prisma__especialidad_empleadosClient<$Result.GetResult<Prisma.$especialidad_empleadosPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Especialidad_empleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {especialidad_empleadosCountArgs} args - Arguments to filter Especialidad_empleados to count.
     * @example
     * // Count the number of Especialidad_empleados
     * const count = await prisma.especialidad_empleados.count({
     *   where: {
     *     // ... the filter for the Especialidad_empleados we want to count
     *   }
     * })
    **/
    count<T extends especialidad_empleadosCountArgs>(
      args?: Subset<T, especialidad_empleadosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Especialidad_empleadosCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Especialidad_empleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Especialidad_empleadosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Especialidad_empleadosAggregateArgs>(args: Subset<T, Especialidad_empleadosAggregateArgs>): Prisma.PrismaPromise<GetEspecialidad_empleadosAggregateType<T>>

    /**
     * Group by Especialidad_empleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {especialidad_empleadosGroupByArgs} args - Group by arguments.
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
      T extends especialidad_empleadosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: especialidad_empleadosGroupByArgs['orderBy'] }
        : { orderBy?: especialidad_empleadosGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, especialidad_empleadosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEspecialidad_empleadosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the especialidad_empleados model
   */
  readonly fields: especialidad_empleadosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for especialidad_empleados.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__especialidad_empleadosClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the especialidad_empleados model
   */
  interface especialidad_empleadosFieldRefs {
    readonly Consecutivo: FieldRef<"especialidad_empleados", 'Int'>
    readonly C_digo_empleado: FieldRef<"especialidad_empleados", 'String'>
    readonly C_digo_especialidad: FieldRef<"especialidad_empleados", 'String'>
    readonly IdCentro: FieldRef<"especialidad_empleados", 'Int'>
    readonly Principal: FieldRef<"especialidad_empleados", 'Boolean'>
    readonly Cups: FieldRef<"especialidad_empleados", 'String'>
    readonly regimen_atencion: FieldRef<"especialidad_empleados", 'String'>
    readonly MinutosXConsulta: FieldRef<"especialidad_empleados", 'Int'>
    readonly NoPacientes: FieldRef<"especialidad_empleados", 'Int'>
    readonly fecha_final: FieldRef<"especialidad_empleados", 'DateTime'>
    readonly fecha_inicial: FieldRef<"especialidad_empleados", 'DateTime'>
    readonly hf_m: FieldRef<"especialidad_empleados", 'String'>
    readonly hf_t: FieldRef<"especialidad_empleados", 'String'>
    readonly hi_m: FieldRef<"especialidad_empleados", 'String'>
    readonly hi_t: FieldRef<"especialidad_empleados", 'String'>
    readonly IdSede: FieldRef<"especialidad_empleados", 'Int'>
    readonly bot: FieldRef<"especialidad_empleados", 'String'>
    readonly contrato: FieldRef<"especialidad_empleados", 'String'>
  }
    

  // Custom InputTypes
  /**
   * especialidad_empleados findUnique
   */
  export type especialidad_empleadosFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidad_empleados
     */
    select?: especialidad_empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidad_empleados
     */
    omit?: especialidad_empleadosOmit<ExtArgs> | null
    /**
     * Filter, which especialidad_empleados to fetch.
     */
    where: especialidad_empleadosWhereUniqueInput
  }

  /**
   * especialidad_empleados findUniqueOrThrow
   */
  export type especialidad_empleadosFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidad_empleados
     */
    select?: especialidad_empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidad_empleados
     */
    omit?: especialidad_empleadosOmit<ExtArgs> | null
    /**
     * Filter, which especialidad_empleados to fetch.
     */
    where: especialidad_empleadosWhereUniqueInput
  }

  /**
   * especialidad_empleados findFirst
   */
  export type especialidad_empleadosFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidad_empleados
     */
    select?: especialidad_empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidad_empleados
     */
    omit?: especialidad_empleadosOmit<ExtArgs> | null
    /**
     * Filter, which especialidad_empleados to fetch.
     */
    where?: especialidad_empleadosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of especialidad_empleados to fetch.
     */
    orderBy?: especialidad_empleadosOrderByWithRelationInput | especialidad_empleadosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for especialidad_empleados.
     */
    cursor?: especialidad_empleadosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` especialidad_empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` especialidad_empleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of especialidad_empleados.
     */
    distinct?: Especialidad_empleadosScalarFieldEnum | Especialidad_empleadosScalarFieldEnum[]
  }

  /**
   * especialidad_empleados findFirstOrThrow
   */
  export type especialidad_empleadosFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidad_empleados
     */
    select?: especialidad_empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidad_empleados
     */
    omit?: especialidad_empleadosOmit<ExtArgs> | null
    /**
     * Filter, which especialidad_empleados to fetch.
     */
    where?: especialidad_empleadosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of especialidad_empleados to fetch.
     */
    orderBy?: especialidad_empleadosOrderByWithRelationInput | especialidad_empleadosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for especialidad_empleados.
     */
    cursor?: especialidad_empleadosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` especialidad_empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` especialidad_empleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of especialidad_empleados.
     */
    distinct?: Especialidad_empleadosScalarFieldEnum | Especialidad_empleadosScalarFieldEnum[]
  }

  /**
   * especialidad_empleados findMany
   */
  export type especialidad_empleadosFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidad_empleados
     */
    select?: especialidad_empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidad_empleados
     */
    omit?: especialidad_empleadosOmit<ExtArgs> | null
    /**
     * Filter, which especialidad_empleados to fetch.
     */
    where?: especialidad_empleadosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of especialidad_empleados to fetch.
     */
    orderBy?: especialidad_empleadosOrderByWithRelationInput | especialidad_empleadosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing especialidad_empleados.
     */
    cursor?: especialidad_empleadosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` especialidad_empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` especialidad_empleados.
     */
    skip?: number
    distinct?: Especialidad_empleadosScalarFieldEnum | Especialidad_empleadosScalarFieldEnum[]
  }

  /**
   * especialidad_empleados create
   */
  export type especialidad_empleadosCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidad_empleados
     */
    select?: especialidad_empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidad_empleados
     */
    omit?: especialidad_empleadosOmit<ExtArgs> | null
    /**
     * The data needed to create a especialidad_empleados.
     */
    data: XOR<especialidad_empleadosCreateInput, especialidad_empleadosUncheckedCreateInput>
  }

  /**
   * especialidad_empleados createMany
   */
  export type especialidad_empleadosCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many especialidad_empleados.
     */
    data: especialidad_empleadosCreateManyInput | especialidad_empleadosCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * especialidad_empleados update
   */
  export type especialidad_empleadosUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidad_empleados
     */
    select?: especialidad_empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidad_empleados
     */
    omit?: especialidad_empleadosOmit<ExtArgs> | null
    /**
     * The data needed to update a especialidad_empleados.
     */
    data: XOR<especialidad_empleadosUpdateInput, especialidad_empleadosUncheckedUpdateInput>
    /**
     * Choose, which especialidad_empleados to update.
     */
    where: especialidad_empleadosWhereUniqueInput
  }

  /**
   * especialidad_empleados updateMany
   */
  export type especialidad_empleadosUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update especialidad_empleados.
     */
    data: XOR<especialidad_empleadosUpdateManyMutationInput, especialidad_empleadosUncheckedUpdateManyInput>
    /**
     * Filter which especialidad_empleados to update
     */
    where?: especialidad_empleadosWhereInput
    /**
     * Limit how many especialidad_empleados to update.
     */
    limit?: number
  }

  /**
   * especialidad_empleados upsert
   */
  export type especialidad_empleadosUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidad_empleados
     */
    select?: especialidad_empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidad_empleados
     */
    omit?: especialidad_empleadosOmit<ExtArgs> | null
    /**
     * The filter to search for the especialidad_empleados to update in case it exists.
     */
    where: especialidad_empleadosWhereUniqueInput
    /**
     * In case the especialidad_empleados found by the `where` argument doesn't exist, create a new especialidad_empleados with this data.
     */
    create: XOR<especialidad_empleadosCreateInput, especialidad_empleadosUncheckedCreateInput>
    /**
     * In case the especialidad_empleados was found with the provided `where` argument, update it with this data.
     */
    update: XOR<especialidad_empleadosUpdateInput, especialidad_empleadosUncheckedUpdateInput>
  }

  /**
   * especialidad_empleados delete
   */
  export type especialidad_empleadosDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidad_empleados
     */
    select?: especialidad_empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidad_empleados
     */
    omit?: especialidad_empleadosOmit<ExtArgs> | null
    /**
     * Filter which especialidad_empleados to delete.
     */
    where: especialidad_empleadosWhereUniqueInput
  }

  /**
   * especialidad_empleados deleteMany
   */
  export type especialidad_empleadosDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which especialidad_empleados to delete
     */
    where?: especialidad_empleadosWhereInput
    /**
     * Limit how many especialidad_empleados to delete.
     */
    limit?: number
  }

  /**
   * especialidad_empleados without action
   */
  export type especialidad_empleadosDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidad_empleados
     */
    select?: especialidad_empleadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidad_empleados
     */
    omit?: especialidad_empleadosOmit<ExtArgs> | null
  }


  /**
   * Model especialidadcupsempleado
   */

  export type AggregateEspecialidadcupsempleado = {
    _count: EspecialidadcupsempleadoCountAggregateOutputType | null
    _avg: EspecialidadcupsempleadoAvgAggregateOutputType | null
    _sum: EspecialidadcupsempleadoSumAggregateOutputType | null
    _min: EspecialidadcupsempleadoMinAggregateOutputType | null
    _max: EspecialidadcupsempleadoMaxAggregateOutputType | null
  }

  export type EspecialidadcupsempleadoAvgAggregateOutputType = {
    Porcentaje: number | null
    Valor: number | null
  }

  export type EspecialidadcupsempleadoSumAggregateOutputType = {
    Porcentaje: number | null
    Valor: number | null
  }

  export type EspecialidadcupsempleadoMinAggregateOutputType = {
    CodigoEmpleado: string | null
    CodigoEspecialidad: string | null
    Cups: string | null
    Porcentaje: number | null
    Valor: number | null
  }

  export type EspecialidadcupsempleadoMaxAggregateOutputType = {
    CodigoEmpleado: string | null
    CodigoEspecialidad: string | null
    Cups: string | null
    Porcentaje: number | null
    Valor: number | null
  }

  export type EspecialidadcupsempleadoCountAggregateOutputType = {
    CodigoEmpleado: number
    CodigoEspecialidad: number
    Cups: number
    Porcentaje: number
    Valor: number
    _all: number
  }


  export type EspecialidadcupsempleadoAvgAggregateInputType = {
    Porcentaje?: true
    Valor?: true
  }

  export type EspecialidadcupsempleadoSumAggregateInputType = {
    Porcentaje?: true
    Valor?: true
  }

  export type EspecialidadcupsempleadoMinAggregateInputType = {
    CodigoEmpleado?: true
    CodigoEspecialidad?: true
    Cups?: true
    Porcentaje?: true
    Valor?: true
  }

  export type EspecialidadcupsempleadoMaxAggregateInputType = {
    CodigoEmpleado?: true
    CodigoEspecialidad?: true
    Cups?: true
    Porcentaje?: true
    Valor?: true
  }

  export type EspecialidadcupsempleadoCountAggregateInputType = {
    CodigoEmpleado?: true
    CodigoEspecialidad?: true
    Cups?: true
    Porcentaje?: true
    Valor?: true
    _all?: true
  }

  export type EspecialidadcupsempleadoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which especialidadcupsempleado to aggregate.
     */
    where?: especialidadcupsempleadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of especialidadcupsempleados to fetch.
     */
    orderBy?: especialidadcupsempleadoOrderByWithRelationInput | especialidadcupsempleadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: especialidadcupsempleadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` especialidadcupsempleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` especialidadcupsempleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned especialidadcupsempleados
    **/
    _count?: true | EspecialidadcupsempleadoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EspecialidadcupsempleadoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EspecialidadcupsempleadoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EspecialidadcupsempleadoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EspecialidadcupsempleadoMaxAggregateInputType
  }

  export type GetEspecialidadcupsempleadoAggregateType<T extends EspecialidadcupsempleadoAggregateArgs> = {
        [P in keyof T & keyof AggregateEspecialidadcupsempleado]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEspecialidadcupsempleado[P]>
      : GetScalarType<T[P], AggregateEspecialidadcupsempleado[P]>
  }




  export type especialidadcupsempleadoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: especialidadcupsempleadoWhereInput
    orderBy?: especialidadcupsempleadoOrderByWithAggregationInput | especialidadcupsempleadoOrderByWithAggregationInput[]
    by: EspecialidadcupsempleadoScalarFieldEnum[] | EspecialidadcupsempleadoScalarFieldEnum
    having?: especialidadcupsempleadoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EspecialidadcupsempleadoCountAggregateInputType | true
    _avg?: EspecialidadcupsempleadoAvgAggregateInputType
    _sum?: EspecialidadcupsempleadoSumAggregateInputType
    _min?: EspecialidadcupsempleadoMinAggregateInputType
    _max?: EspecialidadcupsempleadoMaxAggregateInputType
  }

  export type EspecialidadcupsempleadoGroupByOutputType = {
    CodigoEmpleado: string
    CodigoEspecialidad: string
    Cups: string
    Porcentaje: number | null
    Valor: number | null
    _count: EspecialidadcupsempleadoCountAggregateOutputType | null
    _avg: EspecialidadcupsempleadoAvgAggregateOutputType | null
    _sum: EspecialidadcupsempleadoSumAggregateOutputType | null
    _min: EspecialidadcupsempleadoMinAggregateOutputType | null
    _max: EspecialidadcupsempleadoMaxAggregateOutputType | null
  }

  type GetEspecialidadcupsempleadoGroupByPayload<T extends especialidadcupsempleadoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EspecialidadcupsempleadoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EspecialidadcupsempleadoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EspecialidadcupsempleadoGroupByOutputType[P]>
            : GetScalarType<T[P], EspecialidadcupsempleadoGroupByOutputType[P]>
        }
      >
    >


  export type especialidadcupsempleadoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    CodigoEmpleado?: boolean
    CodigoEspecialidad?: boolean
    Cups?: boolean
    Porcentaje?: boolean
    Valor?: boolean
  }, ExtArgs["result"]["especialidadcupsempleado"]>



  export type especialidadcupsempleadoSelectScalar = {
    CodigoEmpleado?: boolean
    CodigoEspecialidad?: boolean
    Cups?: boolean
    Porcentaje?: boolean
    Valor?: boolean
  }

  export type especialidadcupsempleadoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"CodigoEmpleado" | "CodigoEspecialidad" | "Cups" | "Porcentaje" | "Valor", ExtArgs["result"]["especialidadcupsempleado"]>

  export type $especialidadcupsempleadoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "especialidadcupsempleado"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      CodigoEmpleado: string
      CodigoEspecialidad: string
      Cups: string
      Porcentaje: number | null
      Valor: number | null
    }, ExtArgs["result"]["especialidadcupsempleado"]>
    composites: {}
  }

  type especialidadcupsempleadoGetPayload<S extends boolean | null | undefined | especialidadcupsempleadoDefaultArgs> = $Result.GetResult<Prisma.$especialidadcupsempleadoPayload, S>

  type especialidadcupsempleadoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<especialidadcupsempleadoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EspecialidadcupsempleadoCountAggregateInputType | true
    }

  export interface especialidadcupsempleadoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['especialidadcupsempleado'], meta: { name: 'especialidadcupsempleado' } }
    /**
     * Find zero or one Especialidadcupsempleado that matches the filter.
     * @param {especialidadcupsempleadoFindUniqueArgs} args - Arguments to find a Especialidadcupsempleado
     * @example
     * // Get one Especialidadcupsempleado
     * const especialidadcupsempleado = await prisma.especialidadcupsempleado.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends especialidadcupsempleadoFindUniqueArgs>(args: SelectSubset<T, especialidadcupsempleadoFindUniqueArgs<ExtArgs>>): Prisma__especialidadcupsempleadoClient<$Result.GetResult<Prisma.$especialidadcupsempleadoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Especialidadcupsempleado that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {especialidadcupsempleadoFindUniqueOrThrowArgs} args - Arguments to find a Especialidadcupsempleado
     * @example
     * // Get one Especialidadcupsempleado
     * const especialidadcupsempleado = await prisma.especialidadcupsempleado.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends especialidadcupsempleadoFindUniqueOrThrowArgs>(args: SelectSubset<T, especialidadcupsempleadoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__especialidadcupsempleadoClient<$Result.GetResult<Prisma.$especialidadcupsempleadoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Especialidadcupsempleado that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {especialidadcupsempleadoFindFirstArgs} args - Arguments to find a Especialidadcupsempleado
     * @example
     * // Get one Especialidadcupsempleado
     * const especialidadcupsempleado = await prisma.especialidadcupsempleado.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends especialidadcupsempleadoFindFirstArgs>(args?: SelectSubset<T, especialidadcupsempleadoFindFirstArgs<ExtArgs>>): Prisma__especialidadcupsempleadoClient<$Result.GetResult<Prisma.$especialidadcupsempleadoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Especialidadcupsempleado that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {especialidadcupsempleadoFindFirstOrThrowArgs} args - Arguments to find a Especialidadcupsempleado
     * @example
     * // Get one Especialidadcupsempleado
     * const especialidadcupsempleado = await prisma.especialidadcupsempleado.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends especialidadcupsempleadoFindFirstOrThrowArgs>(args?: SelectSubset<T, especialidadcupsempleadoFindFirstOrThrowArgs<ExtArgs>>): Prisma__especialidadcupsempleadoClient<$Result.GetResult<Prisma.$especialidadcupsempleadoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Especialidadcupsempleados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {especialidadcupsempleadoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Especialidadcupsempleados
     * const especialidadcupsempleados = await prisma.especialidadcupsempleado.findMany()
     * 
     * // Get first 10 Especialidadcupsempleados
     * const especialidadcupsempleados = await prisma.especialidadcupsempleado.findMany({ take: 10 })
     * 
     * // Only select the `CodigoEmpleado`
     * const especialidadcupsempleadoWithCodigoEmpleadoOnly = await prisma.especialidadcupsempleado.findMany({ select: { CodigoEmpleado: true } })
     * 
     */
    findMany<T extends especialidadcupsempleadoFindManyArgs>(args?: SelectSubset<T, especialidadcupsempleadoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$especialidadcupsempleadoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Especialidadcupsempleado.
     * @param {especialidadcupsempleadoCreateArgs} args - Arguments to create a Especialidadcupsempleado.
     * @example
     * // Create one Especialidadcupsempleado
     * const Especialidadcupsempleado = await prisma.especialidadcupsempleado.create({
     *   data: {
     *     // ... data to create a Especialidadcupsempleado
     *   }
     * })
     * 
     */
    create<T extends especialidadcupsempleadoCreateArgs>(args: SelectSubset<T, especialidadcupsempleadoCreateArgs<ExtArgs>>): Prisma__especialidadcupsempleadoClient<$Result.GetResult<Prisma.$especialidadcupsempleadoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Especialidadcupsempleados.
     * @param {especialidadcupsempleadoCreateManyArgs} args - Arguments to create many Especialidadcupsempleados.
     * @example
     * // Create many Especialidadcupsempleados
     * const especialidadcupsempleado = await prisma.especialidadcupsempleado.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends especialidadcupsempleadoCreateManyArgs>(args?: SelectSubset<T, especialidadcupsempleadoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Especialidadcupsempleado.
     * @param {especialidadcupsempleadoDeleteArgs} args - Arguments to delete one Especialidadcupsempleado.
     * @example
     * // Delete one Especialidadcupsempleado
     * const Especialidadcupsempleado = await prisma.especialidadcupsempleado.delete({
     *   where: {
     *     // ... filter to delete one Especialidadcupsempleado
     *   }
     * })
     * 
     */
    delete<T extends especialidadcupsempleadoDeleteArgs>(args: SelectSubset<T, especialidadcupsempleadoDeleteArgs<ExtArgs>>): Prisma__especialidadcupsempleadoClient<$Result.GetResult<Prisma.$especialidadcupsempleadoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Especialidadcupsempleado.
     * @param {especialidadcupsempleadoUpdateArgs} args - Arguments to update one Especialidadcupsempleado.
     * @example
     * // Update one Especialidadcupsempleado
     * const especialidadcupsempleado = await prisma.especialidadcupsempleado.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends especialidadcupsempleadoUpdateArgs>(args: SelectSubset<T, especialidadcupsempleadoUpdateArgs<ExtArgs>>): Prisma__especialidadcupsempleadoClient<$Result.GetResult<Prisma.$especialidadcupsempleadoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Especialidadcupsempleados.
     * @param {especialidadcupsempleadoDeleteManyArgs} args - Arguments to filter Especialidadcupsempleados to delete.
     * @example
     * // Delete a few Especialidadcupsempleados
     * const { count } = await prisma.especialidadcupsempleado.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends especialidadcupsempleadoDeleteManyArgs>(args?: SelectSubset<T, especialidadcupsempleadoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Especialidadcupsempleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {especialidadcupsempleadoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Especialidadcupsempleados
     * const especialidadcupsempleado = await prisma.especialidadcupsempleado.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends especialidadcupsempleadoUpdateManyArgs>(args: SelectSubset<T, especialidadcupsempleadoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Especialidadcupsempleado.
     * @param {especialidadcupsempleadoUpsertArgs} args - Arguments to update or create a Especialidadcupsempleado.
     * @example
     * // Update or create a Especialidadcupsempleado
     * const especialidadcupsempleado = await prisma.especialidadcupsempleado.upsert({
     *   create: {
     *     // ... data to create a Especialidadcupsempleado
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Especialidadcupsempleado we want to update
     *   }
     * })
     */
    upsert<T extends especialidadcupsempleadoUpsertArgs>(args: SelectSubset<T, especialidadcupsempleadoUpsertArgs<ExtArgs>>): Prisma__especialidadcupsempleadoClient<$Result.GetResult<Prisma.$especialidadcupsempleadoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Especialidadcupsempleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {especialidadcupsempleadoCountArgs} args - Arguments to filter Especialidadcupsempleados to count.
     * @example
     * // Count the number of Especialidadcupsempleados
     * const count = await prisma.especialidadcupsempleado.count({
     *   where: {
     *     // ... the filter for the Especialidadcupsempleados we want to count
     *   }
     * })
    **/
    count<T extends especialidadcupsempleadoCountArgs>(
      args?: Subset<T, especialidadcupsempleadoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EspecialidadcupsempleadoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Especialidadcupsempleado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EspecialidadcupsempleadoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EspecialidadcupsempleadoAggregateArgs>(args: Subset<T, EspecialidadcupsempleadoAggregateArgs>): Prisma.PrismaPromise<GetEspecialidadcupsempleadoAggregateType<T>>

    /**
     * Group by Especialidadcupsempleado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {especialidadcupsempleadoGroupByArgs} args - Group by arguments.
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
      T extends especialidadcupsempleadoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: especialidadcupsempleadoGroupByArgs['orderBy'] }
        : { orderBy?: especialidadcupsempleadoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, especialidadcupsempleadoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEspecialidadcupsempleadoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the especialidadcupsempleado model
   */
  readonly fields: especialidadcupsempleadoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for especialidadcupsempleado.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__especialidadcupsempleadoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the especialidadcupsempleado model
   */
  interface especialidadcupsempleadoFieldRefs {
    readonly CodigoEmpleado: FieldRef<"especialidadcupsempleado", 'String'>
    readonly CodigoEspecialidad: FieldRef<"especialidadcupsempleado", 'String'>
    readonly Cups: FieldRef<"especialidadcupsempleado", 'String'>
    readonly Porcentaje: FieldRef<"especialidadcupsempleado", 'Float'>
    readonly Valor: FieldRef<"especialidadcupsempleado", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * especialidadcupsempleado findUnique
   */
  export type especialidadcupsempleadoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidadcupsempleado
     */
    select?: especialidadcupsempleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidadcupsempleado
     */
    omit?: especialidadcupsempleadoOmit<ExtArgs> | null
    /**
     * Filter, which especialidadcupsempleado to fetch.
     */
    where: especialidadcupsempleadoWhereUniqueInput
  }

  /**
   * especialidadcupsempleado findUniqueOrThrow
   */
  export type especialidadcupsempleadoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidadcupsempleado
     */
    select?: especialidadcupsempleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidadcupsempleado
     */
    omit?: especialidadcupsempleadoOmit<ExtArgs> | null
    /**
     * Filter, which especialidadcupsempleado to fetch.
     */
    where: especialidadcupsempleadoWhereUniqueInput
  }

  /**
   * especialidadcupsempleado findFirst
   */
  export type especialidadcupsempleadoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidadcupsempleado
     */
    select?: especialidadcupsempleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidadcupsempleado
     */
    omit?: especialidadcupsempleadoOmit<ExtArgs> | null
    /**
     * Filter, which especialidadcupsempleado to fetch.
     */
    where?: especialidadcupsempleadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of especialidadcupsempleados to fetch.
     */
    orderBy?: especialidadcupsempleadoOrderByWithRelationInput | especialidadcupsempleadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for especialidadcupsempleados.
     */
    cursor?: especialidadcupsempleadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` especialidadcupsempleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` especialidadcupsempleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of especialidadcupsempleados.
     */
    distinct?: EspecialidadcupsempleadoScalarFieldEnum | EspecialidadcupsempleadoScalarFieldEnum[]
  }

  /**
   * especialidadcupsempleado findFirstOrThrow
   */
  export type especialidadcupsempleadoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidadcupsempleado
     */
    select?: especialidadcupsempleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidadcupsempleado
     */
    omit?: especialidadcupsempleadoOmit<ExtArgs> | null
    /**
     * Filter, which especialidadcupsempleado to fetch.
     */
    where?: especialidadcupsempleadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of especialidadcupsempleados to fetch.
     */
    orderBy?: especialidadcupsempleadoOrderByWithRelationInput | especialidadcupsempleadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for especialidadcupsempleados.
     */
    cursor?: especialidadcupsempleadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` especialidadcupsempleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` especialidadcupsempleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of especialidadcupsempleados.
     */
    distinct?: EspecialidadcupsempleadoScalarFieldEnum | EspecialidadcupsempleadoScalarFieldEnum[]
  }

  /**
   * especialidadcupsempleado findMany
   */
  export type especialidadcupsempleadoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidadcupsempleado
     */
    select?: especialidadcupsempleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidadcupsempleado
     */
    omit?: especialidadcupsempleadoOmit<ExtArgs> | null
    /**
     * Filter, which especialidadcupsempleados to fetch.
     */
    where?: especialidadcupsempleadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of especialidadcupsempleados to fetch.
     */
    orderBy?: especialidadcupsempleadoOrderByWithRelationInput | especialidadcupsempleadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing especialidadcupsempleados.
     */
    cursor?: especialidadcupsempleadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` especialidadcupsempleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` especialidadcupsempleados.
     */
    skip?: number
    distinct?: EspecialidadcupsempleadoScalarFieldEnum | EspecialidadcupsempleadoScalarFieldEnum[]
  }

  /**
   * especialidadcupsempleado create
   */
  export type especialidadcupsempleadoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidadcupsempleado
     */
    select?: especialidadcupsempleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidadcupsempleado
     */
    omit?: especialidadcupsempleadoOmit<ExtArgs> | null
    /**
     * The data needed to create a especialidadcupsempleado.
     */
    data: XOR<especialidadcupsempleadoCreateInput, especialidadcupsempleadoUncheckedCreateInput>
  }

  /**
   * especialidadcupsempleado createMany
   */
  export type especialidadcupsempleadoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many especialidadcupsempleados.
     */
    data: especialidadcupsempleadoCreateManyInput | especialidadcupsempleadoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * especialidadcupsempleado update
   */
  export type especialidadcupsempleadoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidadcupsempleado
     */
    select?: especialidadcupsempleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidadcupsempleado
     */
    omit?: especialidadcupsempleadoOmit<ExtArgs> | null
    /**
     * The data needed to update a especialidadcupsempleado.
     */
    data: XOR<especialidadcupsempleadoUpdateInput, especialidadcupsempleadoUncheckedUpdateInput>
    /**
     * Choose, which especialidadcupsempleado to update.
     */
    where: especialidadcupsempleadoWhereUniqueInput
  }

  /**
   * especialidadcupsempleado updateMany
   */
  export type especialidadcupsempleadoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update especialidadcupsempleados.
     */
    data: XOR<especialidadcupsempleadoUpdateManyMutationInput, especialidadcupsempleadoUncheckedUpdateManyInput>
    /**
     * Filter which especialidadcupsempleados to update
     */
    where?: especialidadcupsempleadoWhereInput
    /**
     * Limit how many especialidadcupsempleados to update.
     */
    limit?: number
  }

  /**
   * especialidadcupsempleado upsert
   */
  export type especialidadcupsempleadoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidadcupsempleado
     */
    select?: especialidadcupsempleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidadcupsempleado
     */
    omit?: especialidadcupsempleadoOmit<ExtArgs> | null
    /**
     * The filter to search for the especialidadcupsempleado to update in case it exists.
     */
    where: especialidadcupsempleadoWhereUniqueInput
    /**
     * In case the especialidadcupsempleado found by the `where` argument doesn't exist, create a new especialidadcupsempleado with this data.
     */
    create: XOR<especialidadcupsempleadoCreateInput, especialidadcupsempleadoUncheckedCreateInput>
    /**
     * In case the especialidadcupsempleado was found with the provided `where` argument, update it with this data.
     */
    update: XOR<especialidadcupsempleadoUpdateInput, especialidadcupsempleadoUncheckedUpdateInput>
  }

  /**
   * especialidadcupsempleado delete
   */
  export type especialidadcupsempleadoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidadcupsempleado
     */
    select?: especialidadcupsempleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidadcupsempleado
     */
    omit?: especialidadcupsempleadoOmit<ExtArgs> | null
    /**
     * Filter which especialidadcupsempleado to delete.
     */
    where: especialidadcupsempleadoWhereUniqueInput
  }

  /**
   * especialidadcupsempleado deleteMany
   */
  export type especialidadcupsempleadoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which especialidadcupsempleados to delete
     */
    where?: especialidadcupsempleadoWhereInput
    /**
     * Limit how many especialidadcupsempleados to delete.
     */
    limit?: number
  }

  /**
   * especialidadcupsempleado without action
   */
  export type especialidadcupsempleadoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the especialidadcupsempleado
     */
    select?: especialidadcupsempleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the especialidadcupsempleado
     */
    omit?: especialidadcupsempleadoOmit<ExtArgs> | null
  }


  /**
   * Model tventidades
   */

  export type AggregateTventidades = {
    _count: TventidadesCountAggregateOutputType | null
    _min: TventidadesMinAggregateOutputType | null
    _max: TventidadesMaxAggregateOutputType | null
  }

  export type TventidadesMinAggregateOutputType = {
    Codigo: string | null
    NombreEntidad: string | null
    Departamento: string | null
    Municipio: string | null
    Digitado: boolean | null
    Nit: string | null
    Dv: string | null
    email: string | null
    telefono: string | null
    Direccion: string | null
  }

  export type TventidadesMaxAggregateOutputType = {
    Codigo: string | null
    NombreEntidad: string | null
    Departamento: string | null
    Municipio: string | null
    Digitado: boolean | null
    Nit: string | null
    Dv: string | null
    email: string | null
    telefono: string | null
    Direccion: string | null
  }

  export type TventidadesCountAggregateOutputType = {
    Codigo: number
    NombreEntidad: number
    Departamento: number
    Municipio: number
    Digitado: number
    Nit: number
    Dv: number
    email: number
    telefono: number
    Direccion: number
    _all: number
  }


  export type TventidadesMinAggregateInputType = {
    Codigo?: true
    NombreEntidad?: true
    Departamento?: true
    Municipio?: true
    Digitado?: true
    Nit?: true
    Dv?: true
    email?: true
    telefono?: true
    Direccion?: true
  }

  export type TventidadesMaxAggregateInputType = {
    Codigo?: true
    NombreEntidad?: true
    Departamento?: true
    Municipio?: true
    Digitado?: true
    Nit?: true
    Dv?: true
    email?: true
    telefono?: true
    Direccion?: true
  }

  export type TventidadesCountAggregateInputType = {
    Codigo?: true
    NombreEntidad?: true
    Departamento?: true
    Municipio?: true
    Digitado?: true
    Nit?: true
    Dv?: true
    email?: true
    telefono?: true
    Direccion?: true
    _all?: true
  }

  export type TventidadesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tventidades to aggregate.
     */
    where?: tventidadesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tventidades to fetch.
     */
    orderBy?: tventidadesOrderByWithRelationInput | tventidadesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tventidadesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tventidades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tventidades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tventidades
    **/
    _count?: true | TventidadesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TventidadesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TventidadesMaxAggregateInputType
  }

  export type GetTventidadesAggregateType<T extends TventidadesAggregateArgs> = {
        [P in keyof T & keyof AggregateTventidades]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTventidades[P]>
      : GetScalarType<T[P], AggregateTventidades[P]>
  }




  export type tventidadesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tventidadesWhereInput
    orderBy?: tventidadesOrderByWithAggregationInput | tventidadesOrderByWithAggregationInput[]
    by: TventidadesScalarFieldEnum[] | TventidadesScalarFieldEnum
    having?: tventidadesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TventidadesCountAggregateInputType | true
    _min?: TventidadesMinAggregateInputType
    _max?: TventidadesMaxAggregateInputType
  }

  export type TventidadesGroupByOutputType = {
    Codigo: string
    NombreEntidad: string | null
    Departamento: string | null
    Municipio: string | null
    Digitado: boolean | null
    Nit: string
    Dv: string
    email: string
    telefono: string
    Direccion: string
    _count: TventidadesCountAggregateOutputType | null
    _min: TventidadesMinAggregateOutputType | null
    _max: TventidadesMaxAggregateOutputType | null
  }

  type GetTventidadesGroupByPayload<T extends tventidadesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TventidadesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TventidadesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TventidadesGroupByOutputType[P]>
            : GetScalarType<T[P], TventidadesGroupByOutputType[P]>
        }
      >
    >


  export type tventidadesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Codigo?: boolean
    NombreEntidad?: boolean
    Departamento?: boolean
    Municipio?: boolean
    Digitado?: boolean
    Nit?: boolean
    Dv?: boolean
    email?: boolean
    telefono?: boolean
    Direccion?: boolean
  }, ExtArgs["result"]["tventidades"]>



  export type tventidadesSelectScalar = {
    Codigo?: boolean
    NombreEntidad?: boolean
    Departamento?: boolean
    Municipio?: boolean
    Digitado?: boolean
    Nit?: boolean
    Dv?: boolean
    email?: boolean
    telefono?: boolean
    Direccion?: boolean
  }

  export type tventidadesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Codigo" | "NombreEntidad" | "Departamento" | "Municipio" | "Digitado" | "Nit" | "Dv" | "email" | "telefono" | "Direccion", ExtArgs["result"]["tventidades"]>

  export type $tventidadesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tventidades"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Codigo: string
      NombreEntidad: string | null
      Departamento: string | null
      Municipio: string | null
      Digitado: boolean | null
      Nit: string
      Dv: string
      email: string
      telefono: string
      Direccion: string
    }, ExtArgs["result"]["tventidades"]>
    composites: {}
  }

  type tventidadesGetPayload<S extends boolean | null | undefined | tventidadesDefaultArgs> = $Result.GetResult<Prisma.$tventidadesPayload, S>

  type tventidadesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tventidadesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TventidadesCountAggregateInputType | true
    }

  export interface tventidadesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tventidades'], meta: { name: 'tventidades' } }
    /**
     * Find zero or one Tventidades that matches the filter.
     * @param {tventidadesFindUniqueArgs} args - Arguments to find a Tventidades
     * @example
     * // Get one Tventidades
     * const tventidades = await prisma.tventidades.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tventidadesFindUniqueArgs>(args: SelectSubset<T, tventidadesFindUniqueArgs<ExtArgs>>): Prisma__tventidadesClient<$Result.GetResult<Prisma.$tventidadesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tventidades that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tventidadesFindUniqueOrThrowArgs} args - Arguments to find a Tventidades
     * @example
     * // Get one Tventidades
     * const tventidades = await prisma.tventidades.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tventidadesFindUniqueOrThrowArgs>(args: SelectSubset<T, tventidadesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tventidadesClient<$Result.GetResult<Prisma.$tventidadesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tventidades that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tventidadesFindFirstArgs} args - Arguments to find a Tventidades
     * @example
     * // Get one Tventidades
     * const tventidades = await prisma.tventidades.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tventidadesFindFirstArgs>(args?: SelectSubset<T, tventidadesFindFirstArgs<ExtArgs>>): Prisma__tventidadesClient<$Result.GetResult<Prisma.$tventidadesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tventidades that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tventidadesFindFirstOrThrowArgs} args - Arguments to find a Tventidades
     * @example
     * // Get one Tventidades
     * const tventidades = await prisma.tventidades.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tventidadesFindFirstOrThrowArgs>(args?: SelectSubset<T, tventidadesFindFirstOrThrowArgs<ExtArgs>>): Prisma__tventidadesClient<$Result.GetResult<Prisma.$tventidadesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tventidades that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tventidadesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tventidades
     * const tventidades = await prisma.tventidades.findMany()
     * 
     * // Get first 10 Tventidades
     * const tventidades = await prisma.tventidades.findMany({ take: 10 })
     * 
     * // Only select the `Codigo`
     * const tventidadesWithCodigoOnly = await prisma.tventidades.findMany({ select: { Codigo: true } })
     * 
     */
    findMany<T extends tventidadesFindManyArgs>(args?: SelectSubset<T, tventidadesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tventidadesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tventidades.
     * @param {tventidadesCreateArgs} args - Arguments to create a Tventidades.
     * @example
     * // Create one Tventidades
     * const Tventidades = await prisma.tventidades.create({
     *   data: {
     *     // ... data to create a Tventidades
     *   }
     * })
     * 
     */
    create<T extends tventidadesCreateArgs>(args: SelectSubset<T, tventidadesCreateArgs<ExtArgs>>): Prisma__tventidadesClient<$Result.GetResult<Prisma.$tventidadesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tventidades.
     * @param {tventidadesCreateManyArgs} args - Arguments to create many Tventidades.
     * @example
     * // Create many Tventidades
     * const tventidades = await prisma.tventidades.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tventidadesCreateManyArgs>(args?: SelectSubset<T, tventidadesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tventidades.
     * @param {tventidadesDeleteArgs} args - Arguments to delete one Tventidades.
     * @example
     * // Delete one Tventidades
     * const Tventidades = await prisma.tventidades.delete({
     *   where: {
     *     // ... filter to delete one Tventidades
     *   }
     * })
     * 
     */
    delete<T extends tventidadesDeleteArgs>(args: SelectSubset<T, tventidadesDeleteArgs<ExtArgs>>): Prisma__tventidadesClient<$Result.GetResult<Prisma.$tventidadesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tventidades.
     * @param {tventidadesUpdateArgs} args - Arguments to update one Tventidades.
     * @example
     * // Update one Tventidades
     * const tventidades = await prisma.tventidades.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tventidadesUpdateArgs>(args: SelectSubset<T, tventidadesUpdateArgs<ExtArgs>>): Prisma__tventidadesClient<$Result.GetResult<Prisma.$tventidadesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tventidades.
     * @param {tventidadesDeleteManyArgs} args - Arguments to filter Tventidades to delete.
     * @example
     * // Delete a few Tventidades
     * const { count } = await prisma.tventidades.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tventidadesDeleteManyArgs>(args?: SelectSubset<T, tventidadesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tventidades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tventidadesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tventidades
     * const tventidades = await prisma.tventidades.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tventidadesUpdateManyArgs>(args: SelectSubset<T, tventidadesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tventidades.
     * @param {tventidadesUpsertArgs} args - Arguments to update or create a Tventidades.
     * @example
     * // Update or create a Tventidades
     * const tventidades = await prisma.tventidades.upsert({
     *   create: {
     *     // ... data to create a Tventidades
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tventidades we want to update
     *   }
     * })
     */
    upsert<T extends tventidadesUpsertArgs>(args: SelectSubset<T, tventidadesUpsertArgs<ExtArgs>>): Prisma__tventidadesClient<$Result.GetResult<Prisma.$tventidadesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tventidades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tventidadesCountArgs} args - Arguments to filter Tventidades to count.
     * @example
     * // Count the number of Tventidades
     * const count = await prisma.tventidades.count({
     *   where: {
     *     // ... the filter for the Tventidades we want to count
     *   }
     * })
    **/
    count<T extends tventidadesCountArgs>(
      args?: Subset<T, tventidadesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TventidadesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tventidades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TventidadesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TventidadesAggregateArgs>(args: Subset<T, TventidadesAggregateArgs>): Prisma.PrismaPromise<GetTventidadesAggregateType<T>>

    /**
     * Group by Tventidades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tventidadesGroupByArgs} args - Group by arguments.
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
      T extends tventidadesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tventidadesGroupByArgs['orderBy'] }
        : { orderBy?: tventidadesGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tventidadesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTventidadesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tventidades model
   */
  readonly fields: tventidadesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tventidades.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tventidadesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tventidades model
   */
  interface tventidadesFieldRefs {
    readonly Codigo: FieldRef<"tventidades", 'String'>
    readonly NombreEntidad: FieldRef<"tventidades", 'String'>
    readonly Departamento: FieldRef<"tventidades", 'String'>
    readonly Municipio: FieldRef<"tventidades", 'String'>
    readonly Digitado: FieldRef<"tventidades", 'Boolean'>
    readonly Nit: FieldRef<"tventidades", 'String'>
    readonly Dv: FieldRef<"tventidades", 'String'>
    readonly email: FieldRef<"tventidades", 'String'>
    readonly telefono: FieldRef<"tventidades", 'String'>
    readonly Direccion: FieldRef<"tventidades", 'String'>
  }
    

  // Custom InputTypes
  /**
   * tventidades findUnique
   */
  export type tventidadesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tventidades
     */
    select?: tventidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tventidades
     */
    omit?: tventidadesOmit<ExtArgs> | null
    /**
     * Filter, which tventidades to fetch.
     */
    where: tventidadesWhereUniqueInput
  }

  /**
   * tventidades findUniqueOrThrow
   */
  export type tventidadesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tventidades
     */
    select?: tventidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tventidades
     */
    omit?: tventidadesOmit<ExtArgs> | null
    /**
     * Filter, which tventidades to fetch.
     */
    where: tventidadesWhereUniqueInput
  }

  /**
   * tventidades findFirst
   */
  export type tventidadesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tventidades
     */
    select?: tventidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tventidades
     */
    omit?: tventidadesOmit<ExtArgs> | null
    /**
     * Filter, which tventidades to fetch.
     */
    where?: tventidadesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tventidades to fetch.
     */
    orderBy?: tventidadesOrderByWithRelationInput | tventidadesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tventidades.
     */
    cursor?: tventidadesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tventidades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tventidades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tventidades.
     */
    distinct?: TventidadesScalarFieldEnum | TventidadesScalarFieldEnum[]
  }

  /**
   * tventidades findFirstOrThrow
   */
  export type tventidadesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tventidades
     */
    select?: tventidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tventidades
     */
    omit?: tventidadesOmit<ExtArgs> | null
    /**
     * Filter, which tventidades to fetch.
     */
    where?: tventidadesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tventidades to fetch.
     */
    orderBy?: tventidadesOrderByWithRelationInput | tventidadesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tventidades.
     */
    cursor?: tventidadesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tventidades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tventidades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tventidades.
     */
    distinct?: TventidadesScalarFieldEnum | TventidadesScalarFieldEnum[]
  }

  /**
   * tventidades findMany
   */
  export type tventidadesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tventidades
     */
    select?: tventidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tventidades
     */
    omit?: tventidadesOmit<ExtArgs> | null
    /**
     * Filter, which tventidades to fetch.
     */
    where?: tventidadesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tventidades to fetch.
     */
    orderBy?: tventidadesOrderByWithRelationInput | tventidadesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tventidades.
     */
    cursor?: tventidadesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tventidades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tventidades.
     */
    skip?: number
    distinct?: TventidadesScalarFieldEnum | TventidadesScalarFieldEnum[]
  }

  /**
   * tventidades create
   */
  export type tventidadesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tventidades
     */
    select?: tventidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tventidades
     */
    omit?: tventidadesOmit<ExtArgs> | null
    /**
     * The data needed to create a tventidades.
     */
    data: XOR<tventidadesCreateInput, tventidadesUncheckedCreateInput>
  }

  /**
   * tventidades createMany
   */
  export type tventidadesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tventidades.
     */
    data: tventidadesCreateManyInput | tventidadesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * tventidades update
   */
  export type tventidadesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tventidades
     */
    select?: tventidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tventidades
     */
    omit?: tventidadesOmit<ExtArgs> | null
    /**
     * The data needed to update a tventidades.
     */
    data: XOR<tventidadesUpdateInput, tventidadesUncheckedUpdateInput>
    /**
     * Choose, which tventidades to update.
     */
    where: tventidadesWhereUniqueInput
  }

  /**
   * tventidades updateMany
   */
  export type tventidadesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tventidades.
     */
    data: XOR<tventidadesUpdateManyMutationInput, tventidadesUncheckedUpdateManyInput>
    /**
     * Filter which tventidades to update
     */
    where?: tventidadesWhereInput
    /**
     * Limit how many tventidades to update.
     */
    limit?: number
  }

  /**
   * tventidades upsert
   */
  export type tventidadesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tventidades
     */
    select?: tventidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tventidades
     */
    omit?: tventidadesOmit<ExtArgs> | null
    /**
     * The filter to search for the tventidades to update in case it exists.
     */
    where: tventidadesWhereUniqueInput
    /**
     * In case the tventidades found by the `where` argument doesn't exist, create a new tventidades with this data.
     */
    create: XOR<tventidadesCreateInput, tventidadesUncheckedCreateInput>
    /**
     * In case the tventidades was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tventidadesUpdateInput, tventidadesUncheckedUpdateInput>
  }

  /**
   * tventidades delete
   */
  export type tventidadesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tventidades
     */
    select?: tventidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tventidades
     */
    omit?: tventidadesOmit<ExtArgs> | null
    /**
     * Filter which tventidades to delete.
     */
    where: tventidadesWhereUniqueInput
  }

  /**
   * tventidades deleteMany
   */
  export type tventidadesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tventidades to delete
     */
    where?: tventidadesWhereInput
    /**
     * Limit how many tventidades to delete.
     */
    limit?: number
  }

  /**
   * tventidades without action
   */
  export type tventidadesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tventidades
     */
    select?: tventidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tventidades
     */
    omit?: tventidadesOmit<ExtArgs> | null
  }


  /**
   * Model tvespecialidades
   */

  export type AggregateTvespecialidades = {
    _count: TvespecialidadesCountAggregateOutputType | null
    _avg: TvespecialidadesAvgAggregateOutputType | null
    _sum: TvespecialidadesSumAggregateOutputType | null
    _min: TvespecialidadesMinAggregateOutputType | null
    _max: TvespecialidadesMaxAggregateOutputType | null
  }

  export type TvespecialidadesAvgAggregateOutputType = {
    CodigoServicio: number | null
  }

  export type TvespecialidadesSumAggregateOutputType = {
    CodigoServicio: number | null
  }

  export type TvespecialidadesMinAggregateOutputType = {
    CodigoEspecialidad: string | null
    Especialidad: string | null
    CUPS: string | null
    CodigoServicio: number | null
  }

  export type TvespecialidadesMaxAggregateOutputType = {
    CodigoEspecialidad: string | null
    Especialidad: string | null
    CUPS: string | null
    CodigoServicio: number | null
  }

  export type TvespecialidadesCountAggregateOutputType = {
    CodigoEspecialidad: number
    Especialidad: number
    CUPS: number
    CodigoServicio: number
    _all: number
  }


  export type TvespecialidadesAvgAggregateInputType = {
    CodigoServicio?: true
  }

  export type TvespecialidadesSumAggregateInputType = {
    CodigoServicio?: true
  }

  export type TvespecialidadesMinAggregateInputType = {
    CodigoEspecialidad?: true
    Especialidad?: true
    CUPS?: true
    CodigoServicio?: true
  }

  export type TvespecialidadesMaxAggregateInputType = {
    CodigoEspecialidad?: true
    Especialidad?: true
    CUPS?: true
    CodigoServicio?: true
  }

  export type TvespecialidadesCountAggregateInputType = {
    CodigoEspecialidad?: true
    Especialidad?: true
    CUPS?: true
    CodigoServicio?: true
    _all?: true
  }

  export type TvespecialidadesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tvespecialidades to aggregate.
     */
    where?: tvespecialidadesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tvespecialidades to fetch.
     */
    orderBy?: tvespecialidadesOrderByWithRelationInput | tvespecialidadesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tvespecialidadesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tvespecialidades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tvespecialidades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tvespecialidades
    **/
    _count?: true | TvespecialidadesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TvespecialidadesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TvespecialidadesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TvespecialidadesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TvespecialidadesMaxAggregateInputType
  }

  export type GetTvespecialidadesAggregateType<T extends TvespecialidadesAggregateArgs> = {
        [P in keyof T & keyof AggregateTvespecialidades]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTvespecialidades[P]>
      : GetScalarType<T[P], AggregateTvespecialidades[P]>
  }




  export type tvespecialidadesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tvespecialidadesWhereInput
    orderBy?: tvespecialidadesOrderByWithAggregationInput | tvespecialidadesOrderByWithAggregationInput[]
    by: TvespecialidadesScalarFieldEnum[] | TvespecialidadesScalarFieldEnum
    having?: tvespecialidadesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TvespecialidadesCountAggregateInputType | true
    _avg?: TvespecialidadesAvgAggregateInputType
    _sum?: TvespecialidadesSumAggregateInputType
    _min?: TvespecialidadesMinAggregateInputType
    _max?: TvespecialidadesMaxAggregateInputType
  }

  export type TvespecialidadesGroupByOutputType = {
    CodigoEspecialidad: string
    Especialidad: string | null
    CUPS: string | null
    CodigoServicio: number | null
    _count: TvespecialidadesCountAggregateOutputType | null
    _avg: TvespecialidadesAvgAggregateOutputType | null
    _sum: TvespecialidadesSumAggregateOutputType | null
    _min: TvespecialidadesMinAggregateOutputType | null
    _max: TvespecialidadesMaxAggregateOutputType | null
  }

  type GetTvespecialidadesGroupByPayload<T extends tvespecialidadesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TvespecialidadesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TvespecialidadesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TvespecialidadesGroupByOutputType[P]>
            : GetScalarType<T[P], TvespecialidadesGroupByOutputType[P]>
        }
      >
    >


  export type tvespecialidadesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    CodigoEspecialidad?: boolean
    Especialidad?: boolean
    CUPS?: boolean
    CodigoServicio?: boolean
  }, ExtArgs["result"]["tvespecialidades"]>



  export type tvespecialidadesSelectScalar = {
    CodigoEspecialidad?: boolean
    Especialidad?: boolean
    CUPS?: boolean
    CodigoServicio?: boolean
  }

  export type tvespecialidadesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"CodigoEspecialidad" | "Especialidad" | "CUPS" | "CodigoServicio", ExtArgs["result"]["tvespecialidades"]>

  export type $tvespecialidadesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tvespecialidades"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      CodigoEspecialidad: string
      Especialidad: string | null
      CUPS: string | null
      CodigoServicio: number | null
    }, ExtArgs["result"]["tvespecialidades"]>
    composites: {}
  }

  type tvespecialidadesGetPayload<S extends boolean | null | undefined | tvespecialidadesDefaultArgs> = $Result.GetResult<Prisma.$tvespecialidadesPayload, S>

  type tvespecialidadesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tvespecialidadesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TvespecialidadesCountAggregateInputType | true
    }

  export interface tvespecialidadesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tvespecialidades'], meta: { name: 'tvespecialidades' } }
    /**
     * Find zero or one Tvespecialidades that matches the filter.
     * @param {tvespecialidadesFindUniqueArgs} args - Arguments to find a Tvespecialidades
     * @example
     * // Get one Tvespecialidades
     * const tvespecialidades = await prisma.tvespecialidades.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tvespecialidadesFindUniqueArgs>(args: SelectSubset<T, tvespecialidadesFindUniqueArgs<ExtArgs>>): Prisma__tvespecialidadesClient<$Result.GetResult<Prisma.$tvespecialidadesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tvespecialidades that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tvespecialidadesFindUniqueOrThrowArgs} args - Arguments to find a Tvespecialidades
     * @example
     * // Get one Tvespecialidades
     * const tvespecialidades = await prisma.tvespecialidades.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tvespecialidadesFindUniqueOrThrowArgs>(args: SelectSubset<T, tvespecialidadesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tvespecialidadesClient<$Result.GetResult<Prisma.$tvespecialidadesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tvespecialidades that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tvespecialidadesFindFirstArgs} args - Arguments to find a Tvespecialidades
     * @example
     * // Get one Tvespecialidades
     * const tvespecialidades = await prisma.tvespecialidades.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tvespecialidadesFindFirstArgs>(args?: SelectSubset<T, tvespecialidadesFindFirstArgs<ExtArgs>>): Prisma__tvespecialidadesClient<$Result.GetResult<Prisma.$tvespecialidadesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tvespecialidades that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tvespecialidadesFindFirstOrThrowArgs} args - Arguments to find a Tvespecialidades
     * @example
     * // Get one Tvespecialidades
     * const tvespecialidades = await prisma.tvespecialidades.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tvespecialidadesFindFirstOrThrowArgs>(args?: SelectSubset<T, tvespecialidadesFindFirstOrThrowArgs<ExtArgs>>): Prisma__tvespecialidadesClient<$Result.GetResult<Prisma.$tvespecialidadesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tvespecialidades that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tvespecialidadesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tvespecialidades
     * const tvespecialidades = await prisma.tvespecialidades.findMany()
     * 
     * // Get first 10 Tvespecialidades
     * const tvespecialidades = await prisma.tvespecialidades.findMany({ take: 10 })
     * 
     * // Only select the `CodigoEspecialidad`
     * const tvespecialidadesWithCodigoEspecialidadOnly = await prisma.tvespecialidades.findMany({ select: { CodigoEspecialidad: true } })
     * 
     */
    findMany<T extends tvespecialidadesFindManyArgs>(args?: SelectSubset<T, tvespecialidadesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tvespecialidadesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tvespecialidades.
     * @param {tvespecialidadesCreateArgs} args - Arguments to create a Tvespecialidades.
     * @example
     * // Create one Tvespecialidades
     * const Tvespecialidades = await prisma.tvespecialidades.create({
     *   data: {
     *     // ... data to create a Tvespecialidades
     *   }
     * })
     * 
     */
    create<T extends tvespecialidadesCreateArgs>(args: SelectSubset<T, tvespecialidadesCreateArgs<ExtArgs>>): Prisma__tvespecialidadesClient<$Result.GetResult<Prisma.$tvespecialidadesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tvespecialidades.
     * @param {tvespecialidadesCreateManyArgs} args - Arguments to create many Tvespecialidades.
     * @example
     * // Create many Tvespecialidades
     * const tvespecialidades = await prisma.tvespecialidades.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tvespecialidadesCreateManyArgs>(args?: SelectSubset<T, tvespecialidadesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tvespecialidades.
     * @param {tvespecialidadesDeleteArgs} args - Arguments to delete one Tvespecialidades.
     * @example
     * // Delete one Tvespecialidades
     * const Tvespecialidades = await prisma.tvespecialidades.delete({
     *   where: {
     *     // ... filter to delete one Tvespecialidades
     *   }
     * })
     * 
     */
    delete<T extends tvespecialidadesDeleteArgs>(args: SelectSubset<T, tvespecialidadesDeleteArgs<ExtArgs>>): Prisma__tvespecialidadesClient<$Result.GetResult<Prisma.$tvespecialidadesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tvespecialidades.
     * @param {tvespecialidadesUpdateArgs} args - Arguments to update one Tvespecialidades.
     * @example
     * // Update one Tvespecialidades
     * const tvespecialidades = await prisma.tvespecialidades.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tvespecialidadesUpdateArgs>(args: SelectSubset<T, tvespecialidadesUpdateArgs<ExtArgs>>): Prisma__tvespecialidadesClient<$Result.GetResult<Prisma.$tvespecialidadesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tvespecialidades.
     * @param {tvespecialidadesDeleteManyArgs} args - Arguments to filter Tvespecialidades to delete.
     * @example
     * // Delete a few Tvespecialidades
     * const { count } = await prisma.tvespecialidades.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tvespecialidadesDeleteManyArgs>(args?: SelectSubset<T, tvespecialidadesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tvespecialidades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tvespecialidadesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tvespecialidades
     * const tvespecialidades = await prisma.tvespecialidades.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tvespecialidadesUpdateManyArgs>(args: SelectSubset<T, tvespecialidadesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tvespecialidades.
     * @param {tvespecialidadesUpsertArgs} args - Arguments to update or create a Tvespecialidades.
     * @example
     * // Update or create a Tvespecialidades
     * const tvespecialidades = await prisma.tvespecialidades.upsert({
     *   create: {
     *     // ... data to create a Tvespecialidades
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tvespecialidades we want to update
     *   }
     * })
     */
    upsert<T extends tvespecialidadesUpsertArgs>(args: SelectSubset<T, tvespecialidadesUpsertArgs<ExtArgs>>): Prisma__tvespecialidadesClient<$Result.GetResult<Prisma.$tvespecialidadesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tvespecialidades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tvespecialidadesCountArgs} args - Arguments to filter Tvespecialidades to count.
     * @example
     * // Count the number of Tvespecialidades
     * const count = await prisma.tvespecialidades.count({
     *   where: {
     *     // ... the filter for the Tvespecialidades we want to count
     *   }
     * })
    **/
    count<T extends tvespecialidadesCountArgs>(
      args?: Subset<T, tvespecialidadesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TvespecialidadesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tvespecialidades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TvespecialidadesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TvespecialidadesAggregateArgs>(args: Subset<T, TvespecialidadesAggregateArgs>): Prisma.PrismaPromise<GetTvespecialidadesAggregateType<T>>

    /**
     * Group by Tvespecialidades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tvespecialidadesGroupByArgs} args - Group by arguments.
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
      T extends tvespecialidadesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tvespecialidadesGroupByArgs['orderBy'] }
        : { orderBy?: tvespecialidadesGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tvespecialidadesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTvespecialidadesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tvespecialidades model
   */
  readonly fields: tvespecialidadesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tvespecialidades.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tvespecialidadesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tvespecialidades model
   */
  interface tvespecialidadesFieldRefs {
    readonly CodigoEspecialidad: FieldRef<"tvespecialidades", 'String'>
    readonly Especialidad: FieldRef<"tvespecialidades", 'String'>
    readonly CUPS: FieldRef<"tvespecialidades", 'String'>
    readonly CodigoServicio: FieldRef<"tvespecialidades", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * tvespecialidades findUnique
   */
  export type tvespecialidadesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tvespecialidades
     */
    select?: tvespecialidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tvespecialidades
     */
    omit?: tvespecialidadesOmit<ExtArgs> | null
    /**
     * Filter, which tvespecialidades to fetch.
     */
    where: tvespecialidadesWhereUniqueInput
  }

  /**
   * tvespecialidades findUniqueOrThrow
   */
  export type tvespecialidadesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tvespecialidades
     */
    select?: tvespecialidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tvespecialidades
     */
    omit?: tvespecialidadesOmit<ExtArgs> | null
    /**
     * Filter, which tvespecialidades to fetch.
     */
    where: tvespecialidadesWhereUniqueInput
  }

  /**
   * tvespecialidades findFirst
   */
  export type tvespecialidadesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tvespecialidades
     */
    select?: tvespecialidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tvespecialidades
     */
    omit?: tvespecialidadesOmit<ExtArgs> | null
    /**
     * Filter, which tvespecialidades to fetch.
     */
    where?: tvespecialidadesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tvespecialidades to fetch.
     */
    orderBy?: tvespecialidadesOrderByWithRelationInput | tvespecialidadesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tvespecialidades.
     */
    cursor?: tvespecialidadesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tvespecialidades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tvespecialidades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tvespecialidades.
     */
    distinct?: TvespecialidadesScalarFieldEnum | TvespecialidadesScalarFieldEnum[]
  }

  /**
   * tvespecialidades findFirstOrThrow
   */
  export type tvespecialidadesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tvespecialidades
     */
    select?: tvespecialidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tvespecialidades
     */
    omit?: tvespecialidadesOmit<ExtArgs> | null
    /**
     * Filter, which tvespecialidades to fetch.
     */
    where?: tvespecialidadesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tvespecialidades to fetch.
     */
    orderBy?: tvespecialidadesOrderByWithRelationInput | tvespecialidadesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tvespecialidades.
     */
    cursor?: tvespecialidadesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tvespecialidades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tvespecialidades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tvespecialidades.
     */
    distinct?: TvespecialidadesScalarFieldEnum | TvespecialidadesScalarFieldEnum[]
  }

  /**
   * tvespecialidades findMany
   */
  export type tvespecialidadesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tvespecialidades
     */
    select?: tvespecialidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tvespecialidades
     */
    omit?: tvespecialidadesOmit<ExtArgs> | null
    /**
     * Filter, which tvespecialidades to fetch.
     */
    where?: tvespecialidadesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tvespecialidades to fetch.
     */
    orderBy?: tvespecialidadesOrderByWithRelationInput | tvespecialidadesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tvespecialidades.
     */
    cursor?: tvespecialidadesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tvespecialidades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tvespecialidades.
     */
    skip?: number
    distinct?: TvespecialidadesScalarFieldEnum | TvespecialidadesScalarFieldEnum[]
  }

  /**
   * tvespecialidades create
   */
  export type tvespecialidadesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tvespecialidades
     */
    select?: tvespecialidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tvespecialidades
     */
    omit?: tvespecialidadesOmit<ExtArgs> | null
    /**
     * The data needed to create a tvespecialidades.
     */
    data: XOR<tvespecialidadesCreateInput, tvespecialidadesUncheckedCreateInput>
  }

  /**
   * tvespecialidades createMany
   */
  export type tvespecialidadesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tvespecialidades.
     */
    data: tvespecialidadesCreateManyInput | tvespecialidadesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * tvespecialidades update
   */
  export type tvespecialidadesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tvespecialidades
     */
    select?: tvespecialidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tvespecialidades
     */
    omit?: tvespecialidadesOmit<ExtArgs> | null
    /**
     * The data needed to update a tvespecialidades.
     */
    data: XOR<tvespecialidadesUpdateInput, tvespecialidadesUncheckedUpdateInput>
    /**
     * Choose, which tvespecialidades to update.
     */
    where: tvespecialidadesWhereUniqueInput
  }

  /**
   * tvespecialidades updateMany
   */
  export type tvespecialidadesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tvespecialidades.
     */
    data: XOR<tvespecialidadesUpdateManyMutationInput, tvespecialidadesUncheckedUpdateManyInput>
    /**
     * Filter which tvespecialidades to update
     */
    where?: tvespecialidadesWhereInput
    /**
     * Limit how many tvespecialidades to update.
     */
    limit?: number
  }

  /**
   * tvespecialidades upsert
   */
  export type tvespecialidadesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tvespecialidades
     */
    select?: tvespecialidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tvespecialidades
     */
    omit?: tvespecialidadesOmit<ExtArgs> | null
    /**
     * The filter to search for the tvespecialidades to update in case it exists.
     */
    where: tvespecialidadesWhereUniqueInput
    /**
     * In case the tvespecialidades found by the `where` argument doesn't exist, create a new tvespecialidades with this data.
     */
    create: XOR<tvespecialidadesCreateInput, tvespecialidadesUncheckedCreateInput>
    /**
     * In case the tvespecialidades was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tvespecialidadesUpdateInput, tvespecialidadesUncheckedUpdateInput>
  }

  /**
   * tvespecialidades delete
   */
  export type tvespecialidadesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tvespecialidades
     */
    select?: tvespecialidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tvespecialidades
     */
    omit?: tvespecialidadesOmit<ExtArgs> | null
    /**
     * Filter which tvespecialidades to delete.
     */
    where: tvespecialidadesWhereUniqueInput
  }

  /**
   * tvespecialidades deleteMany
   */
  export type tvespecialidadesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tvespecialidades to delete
     */
    where?: tvespecialidadesWhereInput
    /**
     * Limit how many tvespecialidades to delete.
     */
    limit?: number
  }

  /**
   * tvespecialidades without action
   */
  export type tvespecialidadesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tvespecialidades
     */
    select?: tvespecialidadesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tvespecialidades
     */
    omit?: tvespecialidadesOmit<ExtArgs> | null
  }


  /**
   * Model tbldetalleremision
   */

  export type AggregateTbldetalleremision = {
    _count: TbldetalleremisionCountAggregateOutputType | null
    _avg: TbldetalleremisionAvgAggregateOutputType | null
    _sum: TbldetalleremisionSumAggregateOutputType | null
    _min: TbldetalleremisionMinAggregateOutputType | null
    _max: TbldetalleremisionMaxAggregateOutputType | null
  }

  export type TbldetalleremisionAvgAggregateOutputType = {
    Id: number | null
    IdOrden: number | null
    CodItem: number | null
    CodServicio: number | null
    Ejecutada: number | null
    Mostrar: number | null
  }

  export type TbldetalleremisionSumAggregateOutputType = {
    Id: number | null
    IdOrden: number | null
    CodItem: number | null
    CodServicio: number | null
    Ejecutada: number | null
    Mostrar: number | null
  }

  export type TbldetalleremisionMinAggregateOutputType = {
    Id: number | null
    IdOrden: number | null
    CodItem: number | null
    Descripcion: string | null
    CodServicio: number | null
    Ejecutada: number | null
    Fecha_Ejecutada: Date | null
    Hora_Ejecutada: Date | null
    Ejecutada_por: string | null
    Observaciones: string | null
    Mostrar: number | null
    IdMedicoOrdena: string | null
  }

  export type TbldetalleremisionMaxAggregateOutputType = {
    Id: number | null
    IdOrden: number | null
    CodItem: number | null
    Descripcion: string | null
    CodServicio: number | null
    Ejecutada: number | null
    Fecha_Ejecutada: Date | null
    Hora_Ejecutada: Date | null
    Ejecutada_por: string | null
    Observaciones: string | null
    Mostrar: number | null
    IdMedicoOrdena: string | null
  }

  export type TbldetalleremisionCountAggregateOutputType = {
    Id: number
    IdOrden: number
    CodItem: number
    Descripcion: number
    CodServicio: number
    Ejecutada: number
    Fecha_Ejecutada: number
    Hora_Ejecutada: number
    Ejecutada_por: number
    Observaciones: number
    Mostrar: number
    IdMedicoOrdena: number
    _all: number
  }


  export type TbldetalleremisionAvgAggregateInputType = {
    Id?: true
    IdOrden?: true
    CodItem?: true
    CodServicio?: true
    Ejecutada?: true
    Mostrar?: true
  }

  export type TbldetalleremisionSumAggregateInputType = {
    Id?: true
    IdOrden?: true
    CodItem?: true
    CodServicio?: true
    Ejecutada?: true
    Mostrar?: true
  }

  export type TbldetalleremisionMinAggregateInputType = {
    Id?: true
    IdOrden?: true
    CodItem?: true
    Descripcion?: true
    CodServicio?: true
    Ejecutada?: true
    Fecha_Ejecutada?: true
    Hora_Ejecutada?: true
    Ejecutada_por?: true
    Observaciones?: true
    Mostrar?: true
    IdMedicoOrdena?: true
  }

  export type TbldetalleremisionMaxAggregateInputType = {
    Id?: true
    IdOrden?: true
    CodItem?: true
    Descripcion?: true
    CodServicio?: true
    Ejecutada?: true
    Fecha_Ejecutada?: true
    Hora_Ejecutada?: true
    Ejecutada_por?: true
    Observaciones?: true
    Mostrar?: true
    IdMedicoOrdena?: true
  }

  export type TbldetalleremisionCountAggregateInputType = {
    Id?: true
    IdOrden?: true
    CodItem?: true
    Descripcion?: true
    CodServicio?: true
    Ejecutada?: true
    Fecha_Ejecutada?: true
    Hora_Ejecutada?: true
    Ejecutada_por?: true
    Observaciones?: true
    Mostrar?: true
    IdMedicoOrdena?: true
    _all?: true
  }

  export type TbldetalleremisionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tbldetalleremision to aggregate.
     */
    where?: tbldetalleremisionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tbldetalleremisions to fetch.
     */
    orderBy?: tbldetalleremisionOrderByWithRelationInput | tbldetalleremisionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tbldetalleremisionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tbldetalleremisions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tbldetalleremisions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tbldetalleremisions
    **/
    _count?: true | TbldetalleremisionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TbldetalleremisionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TbldetalleremisionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TbldetalleremisionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TbldetalleremisionMaxAggregateInputType
  }

  export type GetTbldetalleremisionAggregateType<T extends TbldetalleremisionAggregateArgs> = {
        [P in keyof T & keyof AggregateTbldetalleremision]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTbldetalleremision[P]>
      : GetScalarType<T[P], AggregateTbldetalleremision[P]>
  }




  export type tbldetalleremisionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tbldetalleremisionWhereInput
    orderBy?: tbldetalleremisionOrderByWithAggregationInput | tbldetalleremisionOrderByWithAggregationInput[]
    by: TbldetalleremisionScalarFieldEnum[] | TbldetalleremisionScalarFieldEnum
    having?: tbldetalleremisionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TbldetalleremisionCountAggregateInputType | true
    _avg?: TbldetalleremisionAvgAggregateInputType
    _sum?: TbldetalleremisionSumAggregateInputType
    _min?: TbldetalleremisionMinAggregateInputType
    _max?: TbldetalleremisionMaxAggregateInputType
  }

  export type TbldetalleremisionGroupByOutputType = {
    Id: number
    IdOrden: number | null
    CodItem: number | null
    Descripcion: string | null
    CodServicio: number | null
    Ejecutada: number | null
    Fecha_Ejecutada: Date | null
    Hora_Ejecutada: Date | null
    Ejecutada_por: string | null
    Observaciones: string | null
    Mostrar: number | null
    IdMedicoOrdena: string | null
    _count: TbldetalleremisionCountAggregateOutputType | null
    _avg: TbldetalleremisionAvgAggregateOutputType | null
    _sum: TbldetalleremisionSumAggregateOutputType | null
    _min: TbldetalleremisionMinAggregateOutputType | null
    _max: TbldetalleremisionMaxAggregateOutputType | null
  }

  type GetTbldetalleremisionGroupByPayload<T extends tbldetalleremisionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TbldetalleremisionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TbldetalleremisionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TbldetalleremisionGroupByOutputType[P]>
            : GetScalarType<T[P], TbldetalleremisionGroupByOutputType[P]>
        }
      >
    >


  export type tbldetalleremisionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id?: boolean
    IdOrden?: boolean
    CodItem?: boolean
    Descripcion?: boolean
    CodServicio?: boolean
    Ejecutada?: boolean
    Fecha_Ejecutada?: boolean
    Hora_Ejecutada?: boolean
    Ejecutada_por?: boolean
    Observaciones?: boolean
    Mostrar?: boolean
    IdMedicoOrdena?: boolean
  }, ExtArgs["result"]["tbldetalleremision"]>



  export type tbldetalleremisionSelectScalar = {
    Id?: boolean
    IdOrden?: boolean
    CodItem?: boolean
    Descripcion?: boolean
    CodServicio?: boolean
    Ejecutada?: boolean
    Fecha_Ejecutada?: boolean
    Hora_Ejecutada?: boolean
    Ejecutada_por?: boolean
    Observaciones?: boolean
    Mostrar?: boolean
    IdMedicoOrdena?: boolean
  }

  export type tbldetalleremisionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id" | "IdOrden" | "CodItem" | "Descripcion" | "CodServicio" | "Ejecutada" | "Fecha_Ejecutada" | "Hora_Ejecutada" | "Ejecutada_por" | "Observaciones" | "Mostrar" | "IdMedicoOrdena", ExtArgs["result"]["tbldetalleremision"]>

  export type $tbldetalleremisionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tbldetalleremision"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id: number
      IdOrden: number | null
      CodItem: number | null
      Descripcion: string | null
      CodServicio: number | null
      Ejecutada: number | null
      Fecha_Ejecutada: Date | null
      Hora_Ejecutada: Date | null
      Ejecutada_por: string | null
      Observaciones: string | null
      Mostrar: number | null
      IdMedicoOrdena: string | null
    }, ExtArgs["result"]["tbldetalleremision"]>
    composites: {}
  }

  type tbldetalleremisionGetPayload<S extends boolean | null | undefined | tbldetalleremisionDefaultArgs> = $Result.GetResult<Prisma.$tbldetalleremisionPayload, S>

  type tbldetalleremisionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tbldetalleremisionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TbldetalleremisionCountAggregateInputType | true
    }

  export interface tbldetalleremisionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tbldetalleremision'], meta: { name: 'tbldetalleremision' } }
    /**
     * Find zero or one Tbldetalleremision that matches the filter.
     * @param {tbldetalleremisionFindUniqueArgs} args - Arguments to find a Tbldetalleremision
     * @example
     * // Get one Tbldetalleremision
     * const tbldetalleremision = await prisma.tbldetalleremision.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tbldetalleremisionFindUniqueArgs>(args: SelectSubset<T, tbldetalleremisionFindUniqueArgs<ExtArgs>>): Prisma__tbldetalleremisionClient<$Result.GetResult<Prisma.$tbldetalleremisionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tbldetalleremision that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tbldetalleremisionFindUniqueOrThrowArgs} args - Arguments to find a Tbldetalleremision
     * @example
     * // Get one Tbldetalleremision
     * const tbldetalleremision = await prisma.tbldetalleremision.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tbldetalleremisionFindUniqueOrThrowArgs>(args: SelectSubset<T, tbldetalleremisionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tbldetalleremisionClient<$Result.GetResult<Prisma.$tbldetalleremisionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tbldetalleremision that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tbldetalleremisionFindFirstArgs} args - Arguments to find a Tbldetalleremision
     * @example
     * // Get one Tbldetalleremision
     * const tbldetalleremision = await prisma.tbldetalleremision.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tbldetalleremisionFindFirstArgs>(args?: SelectSubset<T, tbldetalleremisionFindFirstArgs<ExtArgs>>): Prisma__tbldetalleremisionClient<$Result.GetResult<Prisma.$tbldetalleremisionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tbldetalleremision that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tbldetalleremisionFindFirstOrThrowArgs} args - Arguments to find a Tbldetalleremision
     * @example
     * // Get one Tbldetalleremision
     * const tbldetalleremision = await prisma.tbldetalleremision.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tbldetalleremisionFindFirstOrThrowArgs>(args?: SelectSubset<T, tbldetalleremisionFindFirstOrThrowArgs<ExtArgs>>): Prisma__tbldetalleremisionClient<$Result.GetResult<Prisma.$tbldetalleremisionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tbldetalleremisions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tbldetalleremisionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tbldetalleremisions
     * const tbldetalleremisions = await prisma.tbldetalleremision.findMany()
     * 
     * // Get first 10 Tbldetalleremisions
     * const tbldetalleremisions = await prisma.tbldetalleremision.findMany({ take: 10 })
     * 
     * // Only select the `Id`
     * const tbldetalleremisionWithIdOnly = await prisma.tbldetalleremision.findMany({ select: { Id: true } })
     * 
     */
    findMany<T extends tbldetalleremisionFindManyArgs>(args?: SelectSubset<T, tbldetalleremisionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tbldetalleremisionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tbldetalleremision.
     * @param {tbldetalleremisionCreateArgs} args - Arguments to create a Tbldetalleremision.
     * @example
     * // Create one Tbldetalleremision
     * const Tbldetalleremision = await prisma.tbldetalleremision.create({
     *   data: {
     *     // ... data to create a Tbldetalleremision
     *   }
     * })
     * 
     */
    create<T extends tbldetalleremisionCreateArgs>(args: SelectSubset<T, tbldetalleremisionCreateArgs<ExtArgs>>): Prisma__tbldetalleremisionClient<$Result.GetResult<Prisma.$tbldetalleremisionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tbldetalleremisions.
     * @param {tbldetalleremisionCreateManyArgs} args - Arguments to create many Tbldetalleremisions.
     * @example
     * // Create many Tbldetalleremisions
     * const tbldetalleremision = await prisma.tbldetalleremision.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tbldetalleremisionCreateManyArgs>(args?: SelectSubset<T, tbldetalleremisionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tbldetalleremision.
     * @param {tbldetalleremisionDeleteArgs} args - Arguments to delete one Tbldetalleremision.
     * @example
     * // Delete one Tbldetalleremision
     * const Tbldetalleremision = await prisma.tbldetalleremision.delete({
     *   where: {
     *     // ... filter to delete one Tbldetalleremision
     *   }
     * })
     * 
     */
    delete<T extends tbldetalleremisionDeleteArgs>(args: SelectSubset<T, tbldetalleremisionDeleteArgs<ExtArgs>>): Prisma__tbldetalleremisionClient<$Result.GetResult<Prisma.$tbldetalleremisionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tbldetalleremision.
     * @param {tbldetalleremisionUpdateArgs} args - Arguments to update one Tbldetalleremision.
     * @example
     * // Update one Tbldetalleremision
     * const tbldetalleremision = await prisma.tbldetalleremision.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tbldetalleremisionUpdateArgs>(args: SelectSubset<T, tbldetalleremisionUpdateArgs<ExtArgs>>): Prisma__tbldetalleremisionClient<$Result.GetResult<Prisma.$tbldetalleremisionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tbldetalleremisions.
     * @param {tbldetalleremisionDeleteManyArgs} args - Arguments to filter Tbldetalleremisions to delete.
     * @example
     * // Delete a few Tbldetalleremisions
     * const { count } = await prisma.tbldetalleremision.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tbldetalleremisionDeleteManyArgs>(args?: SelectSubset<T, tbldetalleremisionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tbldetalleremisions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tbldetalleremisionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tbldetalleremisions
     * const tbldetalleremision = await prisma.tbldetalleremision.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tbldetalleremisionUpdateManyArgs>(args: SelectSubset<T, tbldetalleremisionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tbldetalleremision.
     * @param {tbldetalleremisionUpsertArgs} args - Arguments to update or create a Tbldetalleremision.
     * @example
     * // Update or create a Tbldetalleremision
     * const tbldetalleremision = await prisma.tbldetalleremision.upsert({
     *   create: {
     *     // ... data to create a Tbldetalleremision
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tbldetalleremision we want to update
     *   }
     * })
     */
    upsert<T extends tbldetalleremisionUpsertArgs>(args: SelectSubset<T, tbldetalleremisionUpsertArgs<ExtArgs>>): Prisma__tbldetalleremisionClient<$Result.GetResult<Prisma.$tbldetalleremisionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tbldetalleremisions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tbldetalleremisionCountArgs} args - Arguments to filter Tbldetalleremisions to count.
     * @example
     * // Count the number of Tbldetalleremisions
     * const count = await prisma.tbldetalleremision.count({
     *   where: {
     *     // ... the filter for the Tbldetalleremisions we want to count
     *   }
     * })
    **/
    count<T extends tbldetalleremisionCountArgs>(
      args?: Subset<T, tbldetalleremisionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TbldetalleremisionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tbldetalleremision.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TbldetalleremisionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TbldetalleremisionAggregateArgs>(args: Subset<T, TbldetalleremisionAggregateArgs>): Prisma.PrismaPromise<GetTbldetalleremisionAggregateType<T>>

    /**
     * Group by Tbldetalleremision.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tbldetalleremisionGroupByArgs} args - Group by arguments.
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
      T extends tbldetalleremisionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tbldetalleremisionGroupByArgs['orderBy'] }
        : { orderBy?: tbldetalleremisionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tbldetalleremisionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTbldetalleremisionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tbldetalleremision model
   */
  readonly fields: tbldetalleremisionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tbldetalleremision.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tbldetalleremisionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tbldetalleremision model
   */
  interface tbldetalleremisionFieldRefs {
    readonly Id: FieldRef<"tbldetalleremision", 'Int'>
    readonly IdOrden: FieldRef<"tbldetalleremision", 'Int'>
    readonly CodItem: FieldRef<"tbldetalleremision", 'Int'>
    readonly Descripcion: FieldRef<"tbldetalleremision", 'String'>
    readonly CodServicio: FieldRef<"tbldetalleremision", 'Int'>
    readonly Ejecutada: FieldRef<"tbldetalleremision", 'Int'>
    readonly Fecha_Ejecutada: FieldRef<"tbldetalleremision", 'DateTime'>
    readonly Hora_Ejecutada: FieldRef<"tbldetalleremision", 'DateTime'>
    readonly Ejecutada_por: FieldRef<"tbldetalleremision", 'String'>
    readonly Observaciones: FieldRef<"tbldetalleremision", 'String'>
    readonly Mostrar: FieldRef<"tbldetalleremision", 'Int'>
    readonly IdMedicoOrdena: FieldRef<"tbldetalleremision", 'String'>
  }
    

  // Custom InputTypes
  /**
   * tbldetalleremision findUnique
   */
  export type tbldetalleremisionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tbldetalleremision
     */
    select?: tbldetalleremisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tbldetalleremision
     */
    omit?: tbldetalleremisionOmit<ExtArgs> | null
    /**
     * Filter, which tbldetalleremision to fetch.
     */
    where: tbldetalleremisionWhereUniqueInput
  }

  /**
   * tbldetalleremision findUniqueOrThrow
   */
  export type tbldetalleremisionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tbldetalleremision
     */
    select?: tbldetalleremisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tbldetalleremision
     */
    omit?: tbldetalleremisionOmit<ExtArgs> | null
    /**
     * Filter, which tbldetalleremision to fetch.
     */
    where: tbldetalleremisionWhereUniqueInput
  }

  /**
   * tbldetalleremision findFirst
   */
  export type tbldetalleremisionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tbldetalleremision
     */
    select?: tbldetalleremisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tbldetalleremision
     */
    omit?: tbldetalleremisionOmit<ExtArgs> | null
    /**
     * Filter, which tbldetalleremision to fetch.
     */
    where?: tbldetalleremisionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tbldetalleremisions to fetch.
     */
    orderBy?: tbldetalleremisionOrderByWithRelationInput | tbldetalleremisionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tbldetalleremisions.
     */
    cursor?: tbldetalleremisionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tbldetalleremisions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tbldetalleremisions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tbldetalleremisions.
     */
    distinct?: TbldetalleremisionScalarFieldEnum | TbldetalleremisionScalarFieldEnum[]
  }

  /**
   * tbldetalleremision findFirstOrThrow
   */
  export type tbldetalleremisionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tbldetalleremision
     */
    select?: tbldetalleremisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tbldetalleremision
     */
    omit?: tbldetalleremisionOmit<ExtArgs> | null
    /**
     * Filter, which tbldetalleremision to fetch.
     */
    where?: tbldetalleremisionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tbldetalleremisions to fetch.
     */
    orderBy?: tbldetalleremisionOrderByWithRelationInput | tbldetalleremisionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tbldetalleremisions.
     */
    cursor?: tbldetalleremisionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tbldetalleremisions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tbldetalleremisions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tbldetalleremisions.
     */
    distinct?: TbldetalleremisionScalarFieldEnum | TbldetalleremisionScalarFieldEnum[]
  }

  /**
   * tbldetalleremision findMany
   */
  export type tbldetalleremisionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tbldetalleremision
     */
    select?: tbldetalleremisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tbldetalleremision
     */
    omit?: tbldetalleremisionOmit<ExtArgs> | null
    /**
     * Filter, which tbldetalleremisions to fetch.
     */
    where?: tbldetalleremisionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tbldetalleremisions to fetch.
     */
    orderBy?: tbldetalleremisionOrderByWithRelationInput | tbldetalleremisionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tbldetalleremisions.
     */
    cursor?: tbldetalleremisionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tbldetalleremisions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tbldetalleremisions.
     */
    skip?: number
    distinct?: TbldetalleremisionScalarFieldEnum | TbldetalleremisionScalarFieldEnum[]
  }

  /**
   * tbldetalleremision create
   */
  export type tbldetalleremisionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tbldetalleremision
     */
    select?: tbldetalleremisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tbldetalleremision
     */
    omit?: tbldetalleremisionOmit<ExtArgs> | null
    /**
     * The data needed to create a tbldetalleremision.
     */
    data?: XOR<tbldetalleremisionCreateInput, tbldetalleremisionUncheckedCreateInput>
  }

  /**
   * tbldetalleremision createMany
   */
  export type tbldetalleremisionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tbldetalleremisions.
     */
    data: tbldetalleremisionCreateManyInput | tbldetalleremisionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * tbldetalleremision update
   */
  export type tbldetalleremisionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tbldetalleremision
     */
    select?: tbldetalleremisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tbldetalleremision
     */
    omit?: tbldetalleremisionOmit<ExtArgs> | null
    /**
     * The data needed to update a tbldetalleremision.
     */
    data: XOR<tbldetalleremisionUpdateInput, tbldetalleremisionUncheckedUpdateInput>
    /**
     * Choose, which tbldetalleremision to update.
     */
    where: tbldetalleremisionWhereUniqueInput
  }

  /**
   * tbldetalleremision updateMany
   */
  export type tbldetalleremisionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tbldetalleremisions.
     */
    data: XOR<tbldetalleremisionUpdateManyMutationInput, tbldetalleremisionUncheckedUpdateManyInput>
    /**
     * Filter which tbldetalleremisions to update
     */
    where?: tbldetalleremisionWhereInput
    /**
     * Limit how many tbldetalleremisions to update.
     */
    limit?: number
  }

  /**
   * tbldetalleremision upsert
   */
  export type tbldetalleremisionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tbldetalleremision
     */
    select?: tbldetalleremisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tbldetalleremision
     */
    omit?: tbldetalleremisionOmit<ExtArgs> | null
    /**
     * The filter to search for the tbldetalleremision to update in case it exists.
     */
    where: tbldetalleremisionWhereUniqueInput
    /**
     * In case the tbldetalleremision found by the `where` argument doesn't exist, create a new tbldetalleremision with this data.
     */
    create: XOR<tbldetalleremisionCreateInput, tbldetalleremisionUncheckedCreateInput>
    /**
     * In case the tbldetalleremision was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tbldetalleremisionUpdateInput, tbldetalleremisionUncheckedUpdateInput>
  }

  /**
   * tbldetalleremision delete
   */
  export type tbldetalleremisionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tbldetalleremision
     */
    select?: tbldetalleremisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tbldetalleremision
     */
    omit?: tbldetalleremisionOmit<ExtArgs> | null
    /**
     * Filter which tbldetalleremision to delete.
     */
    where: tbldetalleremisionWhereUniqueInput
  }

  /**
   * tbldetalleremision deleteMany
   */
  export type tbldetalleremisionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tbldetalleremisions to delete
     */
    where?: tbldetalleremisionWhereInput
    /**
     * Limit how many tbldetalleremisions to delete.
     */
    limit?: number
  }

  /**
   * tbldetalleremision without action
   */
  export type tbldetalleremisionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tbldetalleremision
     */
    select?: tbldetalleremisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tbldetalleremision
     */
    omit?: tbldetalleremisionOmit<ExtArgs> | null
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


  export const AgendaScalarFieldEnum: {
    idagenda: 'idagenda',
    IdModalidad: 'IdModalidad',
    fecha_solicitud: 'fecha_solicitud',
    fecha_cita: 'fecha_cita',
    idhora: 'idhora',
    idmedico: 'idmedico',
    idusuario: 'idusuario',
    Telefono: 'Telefono',
    Cumplida: 'Cumplida',
    NoAdmision: 'NoAdmision',
    TipoCita: 'TipoCita',
    AsignadaPor: 'AsignadaPor',
    CanceldaPor: 'CanceldaPor',
    Fecha_cancelacion: 'Fecha_cancelacion',
    TipoContrato: 'TipoContrato',
    Entidad: 'Entidad',
    MedioSolicitud: 'MedioSolicitud',
    Finalidad: 'Finalidad',
    Estado: 'Estado',
    TipoAgenda: 'TipoAgenda',
    Activada_por: 'Activada_por',
    Fecha_Activacion: 'Fecha_Activacion',
    Gestionada: 'Gestionada',
    Hora_Activacion: 'Hora_Activacion',
    LlegoTarde: 'LlegoTarde',
    notificacionrecordatorio: 'notificacionrecordatorio',
    notificacioncancelacion: 'notificacioncancelacion',
    notificacion_encuesta: 'notificacion_encuesta',
    Programa: 'Programa',
    clase_cita: 'clase_cita',
    IdCentro: 'IdCentro',
    IdSede: 'IdSede',
    Bloqueada_Por: 'Bloqueada_Por',
    fecha_bloqueo: 'fecha_bloqueo',
    cancelada_por: 'cancelada_por',
    paciente_cancelada: 'paciente_cancelada',
    fecha_cancelada: 'fecha_cancelada'
  };

  export type AgendaScalarFieldEnum = (typeof AgendaScalarFieldEnum)[keyof typeof AgendaScalarFieldEnum]


  export const UsuariosScalarFieldEnum: {
    Carnet: 'Carnet',
    codPrestador: 'codPrestador',
    Identificaci_n_usuario: 'Identificaci_n_usuario',
    Tipo_identificaci_n: 'Tipo_identificaci_n',
    Primer_apellido: 'Primer_apellido',
    Segundo_apellido: 'Segundo_apellido',
    Primer_nombre: 'Primer_nombre',
    Segundo_nombre: 'Segundo_nombre',
    Direcci_n: 'Direcci_n',
    Tel_fono: 'Tel_fono',
    Tipo_usuario: 'Tipo_usuario',
    Tipo_afiliado: 'Tipo_afiliado',
    C_digo_Ocupaci_n: 'C_digo_Ocupaci_n',
    Unidad_edad: 'Unidad_edad',
    Edad: 'Edad',
    Sexo: 'Sexo',
    Residencia: 'Residencia',
    Zona_residencia: 'Zona_residencia',
    cedula_afiliado: 'cedula_afiliado',
    Fecha_nacimient: 'Fecha_nacimient',
    NHistoria: 'NHistoria',
    Estado_civil: 'Estado_civil',
    Estado: 'Estado',
    fecha_retiro: 'fecha_retiro',
    Ciudad: 'Ciudad',
    Sector: 'Sector',
    Nombre_acudiente: 'Nombre_acudiente',
    Telefono_acudiente: 'Telefono_acudiente',
    Antecedente_Patologico1: 'Antecedente_Patologico1',
    Antecedente_Patologico2: 'Antecedente_Patologico2',
    Antecedente_Patologico3: 'Antecedente_Patologico3',
    Antecedente_Quirurgico1: 'Antecedente_Quirurgico1',
    Antecedente_Quirurgico2: 'Antecedente_Quirurgico2',
    Antecedente_Familiar1: 'Antecedente_Familiar1',
    Antecedente_Familiar2: 'Antecedente_Familiar2',
    Antecedente_Familiar3: 'Antecedente_Familiar3',
    Hemoclasificaci_n: 'Hemoclasificaci_n',
    RH: 'RH',
    Fecha_afiliacion: 'Fecha_afiliacion',
    Parentezco: 'Parentezco',
    Ciudad_cedula: 'Ciudad_cedula',
    Escalafon_afiliado: 'Escalafon_afiliado',
    Discapacidad: 'Discapacidad',
    Estrato: 'Estrato',
    AL1: 'AL1',
    AL2: 'AL2',
    Cod_medico: 'Cod_medico',
    Codigo_eps: 'Codigo_eps',
    Rango: 'Rango',
    Pagos: 'Pagos',
    Cod_odontologo: 'Cod_odontologo',
    Fecha_novedad: 'Fecha_novedad',
    Contrato: 'Contrato',
    N_mero_afiliaci_n: 'N_mero_afiliaci_n',
    Etnico: 'Etnico',
    NumeroSemanasCotizadas: 'NumeroSemanasCotizadas',
    LugarNacimiento: 'LugarNacimiento',
    NroHijos: 'NroHijos',
    Escolaridad: 'Escolaridad',
    FechaAfiliacion: 'FechaAfiliacion',
    Celular: 'Celular',
    CorreoElectr_nico: 'CorreoElectr_nico',
    Responsable: 'Responsable',
    Telefono_Responsable: 'Telefono_Responsable',
    Religion: 'Religion',
    Telefono_Secundario: 'Telefono_Secundario',
    email: 'email',
    Fecha_Creado: 'Fecha_Creado',
    Creado_Por: 'Creado_Por',
    Fecha_Modificado: 'Fecha_Modificado',
    Modificado_por: 'Modificado_por',
    Fecha_Estado: 'Fecha_Estado',
    Portabilidad: 'Portabilidad',
    Fecha_Portabilidad: 'Fecha_Portabilidad',
    nombre_disp_asignado: 'nombre_disp_asignado',
    Genero: 'Genero',
    Poblacion_Clave: 'Poblacion_Clave',
    Gestacion: 'Gestacion',
    Victima_del_Conflicto_armado: 'Victima_del_Conflicto_armado',
    VICTIMA_DEL_MALTRATO: 'VICTIMA_DEL_MALTRATO',
    ABANDONO_SOCIAL: 'ABANDONO_SOCIAL',
    DESESCOLARIZADO: 'DESESCOLARIZADO',
    DESEMPLEADO: 'DESEMPLEADO',
    CARCELARIO: 'CARCELARIO',
    MIGRANTE: 'MIGRANTE',
    TRABAJADORA_SEXUAL: 'TRABAJADORA_SEXUAL',
    POBLACION_LGTBI: 'POBLACION_LGTBI',
    ORIENTACION_SEXUAL: 'ORIENTACION_SEXUAL',
    Barrio: 'Barrio',
    confirmacion_telefono: 'confirmacion_telefono',
    poll: 'poll',
    Clave: 'Clave',
    codPaisResidencia: 'codPaisResidencia',
    codMunicipioResidencia: 'codMunicipioResidencia',
    codDepartamentoResidencia: 'codDepartamentoResidencia',
    codPaisOrigen: 'codPaisOrigen',
    codZonaTerritorialResidencia: 'codZonaTerritorialResidencia',
    incapacidad: 'incapacidad',
    Capitado: 'Capitado',
    IdUsuario: 'IdUsuario',
    IdCentro: 'IdCentro',
    vacunas_completas: 'vacunas_completas',
    intervenciones_quirurgicas: 'intervenciones_quirurgicas',
    alergia: 'alergia'
  };

  export type UsuariosScalarFieldEnum = (typeof UsuariosScalarFieldEnum)[keyof typeof UsuariosScalarFieldEnum]


  export const EmpleadosScalarFieldEnum: {
    C_digo_empleado: 'C_digo_empleado',
    Nombre_empleado: 'Nombre_empleado',
    Direcci_n: 'Direcci_n',
    Tel_fonos: 'Tel_fonos',
    Medico: 'Medico',
    EsMedico: 'EsMedico',
    Odontologo: 'Odontologo',
    Clave: 'Clave',
    Estado_Empleado: 'Estado_Empleado',
    POtraEsp: 'POtraEsp',
    Registro_medico: 'Registro_medico',
    De: 'De',
    Firma: 'Firma',
    Registra: 'Registra',
    enfermeria: 'enfermeria',
    Perfil: 'Perfil',
    Perfil2: 'Perfil2',
    phone: 'phone',
    Firmaimg: 'Firmaimg',
    consultorio: 'consultorio',
    email: 'email',
    IdCentro: 'IdCentro',
    userpic: 'userpic',
    TipoDocumento: 'TipoDocumento',
    Documento: 'Documento'
  };

  export type EmpleadosScalarFieldEnum = (typeof EmpleadosScalarFieldEnum)[keyof typeof EmpleadosScalarFieldEnum]


  export const Especialidad_empleadosScalarFieldEnum: {
    Consecutivo: 'Consecutivo',
    C_digo_empleado: 'C_digo_empleado',
    C_digo_especialidad: 'C_digo_especialidad',
    IdCentro: 'IdCentro',
    Principal: 'Principal',
    Cups: 'Cups',
    regimen_atencion: 'regimen_atencion',
    MinutosXConsulta: 'MinutosXConsulta',
    NoPacientes: 'NoPacientes',
    fecha_final: 'fecha_final',
    fecha_inicial: 'fecha_inicial',
    hf_m: 'hf_m',
    hf_t: 'hf_t',
    hi_m: 'hi_m',
    hi_t: 'hi_t',
    IdSede: 'IdSede',
    bot: 'bot',
    contrato: 'contrato'
  };

  export type Especialidad_empleadosScalarFieldEnum = (typeof Especialidad_empleadosScalarFieldEnum)[keyof typeof Especialidad_empleadosScalarFieldEnum]


  export const EspecialidadcupsempleadoScalarFieldEnum: {
    CodigoEmpleado: 'CodigoEmpleado',
    CodigoEspecialidad: 'CodigoEspecialidad',
    Cups: 'Cups',
    Porcentaje: 'Porcentaje',
    Valor: 'Valor'
  };

  export type EspecialidadcupsempleadoScalarFieldEnum = (typeof EspecialidadcupsempleadoScalarFieldEnum)[keyof typeof EspecialidadcupsempleadoScalarFieldEnum]


  export const TventidadesScalarFieldEnum: {
    Codigo: 'Codigo',
    NombreEntidad: 'NombreEntidad',
    Departamento: 'Departamento',
    Municipio: 'Municipio',
    Digitado: 'Digitado',
    Nit: 'Nit',
    Dv: 'Dv',
    email: 'email',
    telefono: 'telefono',
    Direccion: 'Direccion'
  };

  export type TventidadesScalarFieldEnum = (typeof TventidadesScalarFieldEnum)[keyof typeof TventidadesScalarFieldEnum]


  export const TvespecialidadesScalarFieldEnum: {
    CodigoEspecialidad: 'CodigoEspecialidad',
    Especialidad: 'Especialidad',
    CUPS: 'CUPS',
    CodigoServicio: 'CodigoServicio'
  };

  export type TvespecialidadesScalarFieldEnum = (typeof TvespecialidadesScalarFieldEnum)[keyof typeof TvespecialidadesScalarFieldEnum]


  export const TbldetalleremisionScalarFieldEnum: {
    Id: 'Id',
    IdOrden: 'IdOrden',
    CodItem: 'CodItem',
    Descripcion: 'Descripcion',
    CodServicio: 'CodServicio',
    Ejecutada: 'Ejecutada',
    Fecha_Ejecutada: 'Fecha_Ejecutada',
    Hora_Ejecutada: 'Hora_Ejecutada',
    Ejecutada_por: 'Ejecutada_por',
    Observaciones: 'Observaciones',
    Mostrar: 'Mostrar',
    IdMedicoOrdena: 'IdMedicoOrdena'
  };

  export type TbldetalleremisionScalarFieldEnum = (typeof TbldetalleremisionScalarFieldEnum)[keyof typeof TbldetalleremisionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const agendaOrderByRelevanceFieldEnum: {
    idhora: 'idhora',
    idmedico: 'idmedico',
    idusuario: 'idusuario',
    Telefono: 'Telefono',
    TipoCita: 'TipoCita',
    AsignadaPor: 'AsignadaPor',
    CanceldaPor: 'CanceldaPor',
    TipoContrato: 'TipoContrato',
    Entidad: 'Entidad',
    MedioSolicitud: 'MedioSolicitud',
    Finalidad: 'Finalidad',
    Estado: 'Estado',
    TipoAgenda: 'TipoAgenda',
    Activada_por: 'Activada_por',
    LlegoTarde: 'LlegoTarde',
    notificacionrecordatorio: 'notificacionrecordatorio',
    notificacioncancelacion: 'notificacioncancelacion',
    notificacion_encuesta: 'notificacion_encuesta',
    Programa: 'Programa',
    clase_cita: 'clase_cita',
    Bloqueada_Por: 'Bloqueada_Por',
    cancelada_por: 'cancelada_por',
    paciente_cancelada: 'paciente_cancelada'
  };

  export type agendaOrderByRelevanceFieldEnum = (typeof agendaOrderByRelevanceFieldEnum)[keyof typeof agendaOrderByRelevanceFieldEnum]


  export const usuariosOrderByRelevanceFieldEnum: {
    Carnet: 'Carnet',
    codPrestador: 'codPrestador',
    Identificaci_n_usuario: 'Identificaci_n_usuario',
    Tipo_identificaci_n: 'Tipo_identificaci_n',
    Primer_apellido: 'Primer_apellido',
    Segundo_apellido: 'Segundo_apellido',
    Primer_nombre: 'Primer_nombre',
    Segundo_nombre: 'Segundo_nombre',
    Direcci_n: 'Direcci_n',
    Tel_fono: 'Tel_fono',
    Tipo_usuario: 'Tipo_usuario',
    Tipo_afiliado: 'Tipo_afiliado',
    C_digo_Ocupaci_n: 'C_digo_Ocupaci_n',
    Unidad_edad: 'Unidad_edad',
    Edad: 'Edad',
    Sexo: 'Sexo',
    Residencia: 'Residencia',
    Zona_residencia: 'Zona_residencia',
    cedula_afiliado: 'cedula_afiliado',
    NHistoria: 'NHistoria',
    Estado_civil: 'Estado_civil',
    Estado: 'Estado',
    Ciudad: 'Ciudad',
    Sector: 'Sector',
    Nombre_acudiente: 'Nombre_acudiente',
    Telefono_acudiente: 'Telefono_acudiente',
    Antecedente_Patologico1: 'Antecedente_Patologico1',
    Antecedente_Patologico2: 'Antecedente_Patologico2',
    Antecedente_Patologico3: 'Antecedente_Patologico3',
    Antecedente_Quirurgico1: 'Antecedente_Quirurgico1',
    Antecedente_Quirurgico2: 'Antecedente_Quirurgico2',
    Antecedente_Familiar1: 'Antecedente_Familiar1',
    Antecedente_Familiar2: 'Antecedente_Familiar2',
    Antecedente_Familiar3: 'Antecedente_Familiar3',
    Hemoclasificaci_n: 'Hemoclasificaci_n',
    RH: 'RH',
    Parentezco: 'Parentezco',
    Ciudad_cedula: 'Ciudad_cedula',
    Escalafon_afiliado: 'Escalafon_afiliado',
    Discapacidad: 'Discapacidad',
    Estrato: 'Estrato',
    Cod_medico: 'Cod_medico',
    Codigo_eps: 'Codigo_eps',
    Rango: 'Rango',
    Pagos: 'Pagos',
    Cod_odontologo: 'Cod_odontologo',
    Contrato: 'Contrato',
    N_mero_afiliaci_n: 'N_mero_afiliaci_n',
    Etnico: 'Etnico',
    LugarNacimiento: 'LugarNacimiento',
    Escolaridad: 'Escolaridad',
    Celular: 'Celular',
    CorreoElectr_nico: 'CorreoElectr_nico',
    Responsable: 'Responsable',
    Telefono_Responsable: 'Telefono_Responsable',
    Religion: 'Religion',
    Telefono_Secundario: 'Telefono_Secundario',
    email: 'email',
    Fecha_Creado: 'Fecha_Creado',
    Creado_Por: 'Creado_Por',
    Fecha_Modificado: 'Fecha_Modificado',
    Modificado_por: 'Modificado_por',
    Fecha_Estado: 'Fecha_Estado',
    Portabilidad: 'Portabilidad',
    Fecha_Portabilidad: 'Fecha_Portabilidad',
    nombre_disp_asignado: 'nombre_disp_asignado',
    Genero: 'Genero',
    Poblacion_Clave: 'Poblacion_Clave',
    Gestacion: 'Gestacion',
    Victima_del_Conflicto_armado: 'Victima_del_Conflicto_armado',
    VICTIMA_DEL_MALTRATO: 'VICTIMA_DEL_MALTRATO',
    ABANDONO_SOCIAL: 'ABANDONO_SOCIAL',
    DESESCOLARIZADO: 'DESESCOLARIZADO',
    DESEMPLEADO: 'DESEMPLEADO',
    CARCELARIO: 'CARCELARIO',
    MIGRANTE: 'MIGRANTE',
    TRABAJADORA_SEXUAL: 'TRABAJADORA_SEXUAL',
    POBLACION_LGTBI: 'POBLACION_LGTBI',
    ORIENTACION_SEXUAL: 'ORIENTACION_SEXUAL',
    Barrio: 'Barrio',
    confirmacion_telefono: 'confirmacion_telefono',
    poll: 'poll',
    Clave: 'Clave',
    codPaisResidencia: 'codPaisResidencia',
    codMunicipioResidencia: 'codMunicipioResidencia',
    codDepartamentoResidencia: 'codDepartamentoResidencia',
    codPaisOrigen: 'codPaisOrigen',
    codZonaTerritorialResidencia: 'codZonaTerritorialResidencia',
    incapacidad: 'incapacidad',
    vacunas_completas: 'vacunas_completas',
    intervenciones_quirurgicas: 'intervenciones_quirurgicas',
    alergia: 'alergia'
  };

  export type usuariosOrderByRelevanceFieldEnum = (typeof usuariosOrderByRelevanceFieldEnum)[keyof typeof usuariosOrderByRelevanceFieldEnum]


  export const empleadosOrderByRelevanceFieldEnum: {
    C_digo_empleado: 'C_digo_empleado',
    Nombre_empleado: 'Nombre_empleado',
    Direcci_n: 'Direcci_n',
    Tel_fonos: 'Tel_fonos',
    Clave: 'Clave',
    Registro_medico: 'Registro_medico',
    De: 'De',
    Firma: 'Firma',
    phone: 'phone',
    consultorio: 'consultorio',
    email: 'email',
    TipoDocumento: 'TipoDocumento',
    Documento: 'Documento'
  };

  export type empleadosOrderByRelevanceFieldEnum = (typeof empleadosOrderByRelevanceFieldEnum)[keyof typeof empleadosOrderByRelevanceFieldEnum]


  export const especialidad_empleadosOrderByRelevanceFieldEnum: {
    C_digo_empleado: 'C_digo_empleado',
    C_digo_especialidad: 'C_digo_especialidad',
    Cups: 'Cups',
    regimen_atencion: 'regimen_atencion',
    hf_m: 'hf_m',
    hf_t: 'hf_t',
    hi_m: 'hi_m',
    hi_t: 'hi_t',
    bot: 'bot',
    contrato: 'contrato'
  };

  export type especialidad_empleadosOrderByRelevanceFieldEnum = (typeof especialidad_empleadosOrderByRelevanceFieldEnum)[keyof typeof especialidad_empleadosOrderByRelevanceFieldEnum]


  export const especialidadcupsempleadoOrderByRelevanceFieldEnum: {
    CodigoEmpleado: 'CodigoEmpleado',
    CodigoEspecialidad: 'CodigoEspecialidad',
    Cups: 'Cups'
  };

  export type especialidadcupsempleadoOrderByRelevanceFieldEnum = (typeof especialidadcupsempleadoOrderByRelevanceFieldEnum)[keyof typeof especialidadcupsempleadoOrderByRelevanceFieldEnum]


  export const tventidadesOrderByRelevanceFieldEnum: {
    Codigo: 'Codigo',
    NombreEntidad: 'NombreEntidad',
    Departamento: 'Departamento',
    Municipio: 'Municipio',
    Nit: 'Nit',
    Dv: 'Dv',
    email: 'email',
    telefono: 'telefono',
    Direccion: 'Direccion'
  };

  export type tventidadesOrderByRelevanceFieldEnum = (typeof tventidadesOrderByRelevanceFieldEnum)[keyof typeof tventidadesOrderByRelevanceFieldEnum]


  export const tvespecialidadesOrderByRelevanceFieldEnum: {
    CodigoEspecialidad: 'CodigoEspecialidad',
    Especialidad: 'Especialidad',
    CUPS: 'CUPS'
  };

  export type tvespecialidadesOrderByRelevanceFieldEnum = (typeof tvespecialidadesOrderByRelevanceFieldEnum)[keyof typeof tvespecialidadesOrderByRelevanceFieldEnum]


  export const tbldetalleremisionOrderByRelevanceFieldEnum: {
    Descripcion: 'Descripcion',
    Ejecutada_por: 'Ejecutada_por',
    Observaciones: 'Observaciones',
    IdMedicoOrdena: 'IdMedicoOrdena'
  };

  export type tbldetalleremisionOrderByRelevanceFieldEnum = (typeof tbldetalleremisionOrderByRelevanceFieldEnum)[keyof typeof tbldetalleremisionOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'usuarios_Capitado'
   */
  export type Enumusuarios_CapitadoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'usuarios_Capitado'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Bytes'
   */
  export type BytesFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Bytes'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type agendaWhereInput = {
    AND?: agendaWhereInput | agendaWhereInput[]
    OR?: agendaWhereInput[]
    NOT?: agendaWhereInput | agendaWhereInput[]
    idagenda?: IntFilter<"agenda"> | number
    IdModalidad?: IntFilter<"agenda"> | number
    fecha_solicitud?: DateTimeNullableFilter<"agenda"> | Date | string | null
    fecha_cita?: DateTimeFilter<"agenda"> | Date | string
    idhora?: StringFilter<"agenda"> | string
    idmedico?: StringFilter<"agenda"> | string
    idusuario?: StringNullableFilter<"agenda"> | string | null
    Telefono?: StringNullableFilter<"agenda"> | string | null
    Cumplida?: IntNullableFilter<"agenda"> | number | null
    NoAdmision?: IntNullableFilter<"agenda"> | number | null
    TipoCita?: StringNullableFilter<"agenda"> | string | null
    AsignadaPor?: StringNullableFilter<"agenda"> | string | null
    CanceldaPor?: StringNullableFilter<"agenda"> | string | null
    Fecha_cancelacion?: DateTimeNullableFilter<"agenda"> | Date | string | null
    TipoContrato?: StringNullableFilter<"agenda"> | string | null
    Entidad?: StringNullableFilter<"agenda"> | string | null
    MedioSolicitud?: StringNullableFilter<"agenda"> | string | null
    Finalidad?: StringNullableFilter<"agenda"> | string | null
    Estado?: StringNullableFilter<"agenda"> | string | null
    TipoAgenda?: StringNullableFilter<"agenda"> | string | null
    Activada_por?: StringNullableFilter<"agenda"> | string | null
    Fecha_Activacion?: DateTimeNullableFilter<"agenda"> | Date | string | null
    Gestionada?: IntNullableFilter<"agenda"> | number | null
    Hora_Activacion?: DateTimeNullableFilter<"agenda"> | Date | string | null
    LlegoTarde?: StringNullableFilter<"agenda"> | string | null
    notificacionrecordatorio?: StringNullableFilter<"agenda"> | string | null
    notificacioncancelacion?: StringNullableFilter<"agenda"> | string | null
    notificacion_encuesta?: StringNullableFilter<"agenda"> | string | null
    Programa?: StringNullableFilter<"agenda"> | string | null
    clase_cita?: StringNullableFilter<"agenda"> | string | null
    IdCentro?: IntNullableFilter<"agenda"> | number | null
    IdSede?: IntNullableFilter<"agenda"> | number | null
    Bloqueada_Por?: StringNullableFilter<"agenda"> | string | null
    fecha_bloqueo?: DateTimeNullableFilter<"agenda"> | Date | string | null
    cancelada_por?: StringNullableFilter<"agenda"> | string | null
    paciente_cancelada?: StringNullableFilter<"agenda"> | string | null
    fecha_cancelada?: DateTimeNullableFilter<"agenda"> | Date | string | null
  }

  export type agendaOrderByWithRelationInput = {
    idagenda?: SortOrder
    IdModalidad?: SortOrder
    fecha_solicitud?: SortOrderInput | SortOrder
    fecha_cita?: SortOrder
    idhora?: SortOrder
    idmedico?: SortOrder
    idusuario?: SortOrderInput | SortOrder
    Telefono?: SortOrderInput | SortOrder
    Cumplida?: SortOrderInput | SortOrder
    NoAdmision?: SortOrderInput | SortOrder
    TipoCita?: SortOrderInput | SortOrder
    AsignadaPor?: SortOrderInput | SortOrder
    CanceldaPor?: SortOrderInput | SortOrder
    Fecha_cancelacion?: SortOrderInput | SortOrder
    TipoContrato?: SortOrderInput | SortOrder
    Entidad?: SortOrderInput | SortOrder
    MedioSolicitud?: SortOrderInput | SortOrder
    Finalidad?: SortOrderInput | SortOrder
    Estado?: SortOrderInput | SortOrder
    TipoAgenda?: SortOrderInput | SortOrder
    Activada_por?: SortOrderInput | SortOrder
    Fecha_Activacion?: SortOrderInput | SortOrder
    Gestionada?: SortOrderInput | SortOrder
    Hora_Activacion?: SortOrderInput | SortOrder
    LlegoTarde?: SortOrderInput | SortOrder
    notificacionrecordatorio?: SortOrderInput | SortOrder
    notificacioncancelacion?: SortOrderInput | SortOrder
    notificacion_encuesta?: SortOrderInput | SortOrder
    Programa?: SortOrderInput | SortOrder
    clase_cita?: SortOrderInput | SortOrder
    IdCentro?: SortOrderInput | SortOrder
    IdSede?: SortOrderInput | SortOrder
    Bloqueada_Por?: SortOrderInput | SortOrder
    fecha_bloqueo?: SortOrderInput | SortOrder
    cancelada_por?: SortOrderInput | SortOrder
    paciente_cancelada?: SortOrderInput | SortOrder
    fecha_cancelada?: SortOrderInput | SortOrder
    _relevance?: agendaOrderByRelevanceInput
  }

  export type agendaWhereUniqueInput = Prisma.AtLeast<{
    idagenda?: number
    fecha_cita_idhora_idmedico_IdSede?: agendaFecha_citaIdhoraIdmedicoIdSedeCompoundUniqueInput
    AND?: agendaWhereInput | agendaWhereInput[]
    OR?: agendaWhereInput[]
    NOT?: agendaWhereInput | agendaWhereInput[]
    IdModalidad?: IntFilter<"agenda"> | number
    fecha_solicitud?: DateTimeNullableFilter<"agenda"> | Date | string | null
    fecha_cita?: DateTimeFilter<"agenda"> | Date | string
    idhora?: StringFilter<"agenda"> | string
    idmedico?: StringFilter<"agenda"> | string
    idusuario?: StringNullableFilter<"agenda"> | string | null
    Telefono?: StringNullableFilter<"agenda"> | string | null
    Cumplida?: IntNullableFilter<"agenda"> | number | null
    NoAdmision?: IntNullableFilter<"agenda"> | number | null
    TipoCita?: StringNullableFilter<"agenda"> | string | null
    AsignadaPor?: StringNullableFilter<"agenda"> | string | null
    CanceldaPor?: StringNullableFilter<"agenda"> | string | null
    Fecha_cancelacion?: DateTimeNullableFilter<"agenda"> | Date | string | null
    TipoContrato?: StringNullableFilter<"agenda"> | string | null
    Entidad?: StringNullableFilter<"agenda"> | string | null
    MedioSolicitud?: StringNullableFilter<"agenda"> | string | null
    Finalidad?: StringNullableFilter<"agenda"> | string | null
    Estado?: StringNullableFilter<"agenda"> | string | null
    TipoAgenda?: StringNullableFilter<"agenda"> | string | null
    Activada_por?: StringNullableFilter<"agenda"> | string | null
    Fecha_Activacion?: DateTimeNullableFilter<"agenda"> | Date | string | null
    Gestionada?: IntNullableFilter<"agenda"> | number | null
    Hora_Activacion?: DateTimeNullableFilter<"agenda"> | Date | string | null
    LlegoTarde?: StringNullableFilter<"agenda"> | string | null
    notificacionrecordatorio?: StringNullableFilter<"agenda"> | string | null
    notificacioncancelacion?: StringNullableFilter<"agenda"> | string | null
    notificacion_encuesta?: StringNullableFilter<"agenda"> | string | null
    Programa?: StringNullableFilter<"agenda"> | string | null
    clase_cita?: StringNullableFilter<"agenda"> | string | null
    IdCentro?: IntNullableFilter<"agenda"> | number | null
    IdSede?: IntNullableFilter<"agenda"> | number | null
    Bloqueada_Por?: StringNullableFilter<"agenda"> | string | null
    fecha_bloqueo?: DateTimeNullableFilter<"agenda"> | Date | string | null
    cancelada_por?: StringNullableFilter<"agenda"> | string | null
    paciente_cancelada?: StringNullableFilter<"agenda"> | string | null
    fecha_cancelada?: DateTimeNullableFilter<"agenda"> | Date | string | null
  }, "idagenda" | "fecha_cita_idhora_idmedico_IdSede">

  export type agendaOrderByWithAggregationInput = {
    idagenda?: SortOrder
    IdModalidad?: SortOrder
    fecha_solicitud?: SortOrderInput | SortOrder
    fecha_cita?: SortOrder
    idhora?: SortOrder
    idmedico?: SortOrder
    idusuario?: SortOrderInput | SortOrder
    Telefono?: SortOrderInput | SortOrder
    Cumplida?: SortOrderInput | SortOrder
    NoAdmision?: SortOrderInput | SortOrder
    TipoCita?: SortOrderInput | SortOrder
    AsignadaPor?: SortOrderInput | SortOrder
    CanceldaPor?: SortOrderInput | SortOrder
    Fecha_cancelacion?: SortOrderInput | SortOrder
    TipoContrato?: SortOrderInput | SortOrder
    Entidad?: SortOrderInput | SortOrder
    MedioSolicitud?: SortOrderInput | SortOrder
    Finalidad?: SortOrderInput | SortOrder
    Estado?: SortOrderInput | SortOrder
    TipoAgenda?: SortOrderInput | SortOrder
    Activada_por?: SortOrderInput | SortOrder
    Fecha_Activacion?: SortOrderInput | SortOrder
    Gestionada?: SortOrderInput | SortOrder
    Hora_Activacion?: SortOrderInput | SortOrder
    LlegoTarde?: SortOrderInput | SortOrder
    notificacionrecordatorio?: SortOrderInput | SortOrder
    notificacioncancelacion?: SortOrderInput | SortOrder
    notificacion_encuesta?: SortOrderInput | SortOrder
    Programa?: SortOrderInput | SortOrder
    clase_cita?: SortOrderInput | SortOrder
    IdCentro?: SortOrderInput | SortOrder
    IdSede?: SortOrderInput | SortOrder
    Bloqueada_Por?: SortOrderInput | SortOrder
    fecha_bloqueo?: SortOrderInput | SortOrder
    cancelada_por?: SortOrderInput | SortOrder
    paciente_cancelada?: SortOrderInput | SortOrder
    fecha_cancelada?: SortOrderInput | SortOrder
    _count?: agendaCountOrderByAggregateInput
    _avg?: agendaAvgOrderByAggregateInput
    _max?: agendaMaxOrderByAggregateInput
    _min?: agendaMinOrderByAggregateInput
    _sum?: agendaSumOrderByAggregateInput
  }

  export type agendaScalarWhereWithAggregatesInput = {
    AND?: agendaScalarWhereWithAggregatesInput | agendaScalarWhereWithAggregatesInput[]
    OR?: agendaScalarWhereWithAggregatesInput[]
    NOT?: agendaScalarWhereWithAggregatesInput | agendaScalarWhereWithAggregatesInput[]
    idagenda?: IntWithAggregatesFilter<"agenda"> | number
    IdModalidad?: IntWithAggregatesFilter<"agenda"> | number
    fecha_solicitud?: DateTimeNullableWithAggregatesFilter<"agenda"> | Date | string | null
    fecha_cita?: DateTimeWithAggregatesFilter<"agenda"> | Date | string
    idhora?: StringWithAggregatesFilter<"agenda"> | string
    idmedico?: StringWithAggregatesFilter<"agenda"> | string
    idusuario?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    Telefono?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    Cumplida?: IntNullableWithAggregatesFilter<"agenda"> | number | null
    NoAdmision?: IntNullableWithAggregatesFilter<"agenda"> | number | null
    TipoCita?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    AsignadaPor?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    CanceldaPor?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    Fecha_cancelacion?: DateTimeNullableWithAggregatesFilter<"agenda"> | Date | string | null
    TipoContrato?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    Entidad?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    MedioSolicitud?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    Finalidad?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    Estado?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    TipoAgenda?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    Activada_por?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    Fecha_Activacion?: DateTimeNullableWithAggregatesFilter<"agenda"> | Date | string | null
    Gestionada?: IntNullableWithAggregatesFilter<"agenda"> | number | null
    Hora_Activacion?: DateTimeNullableWithAggregatesFilter<"agenda"> | Date | string | null
    LlegoTarde?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    notificacionrecordatorio?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    notificacioncancelacion?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    notificacion_encuesta?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    Programa?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    clase_cita?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    IdCentro?: IntNullableWithAggregatesFilter<"agenda"> | number | null
    IdSede?: IntNullableWithAggregatesFilter<"agenda"> | number | null
    Bloqueada_Por?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    fecha_bloqueo?: DateTimeNullableWithAggregatesFilter<"agenda"> | Date | string | null
    cancelada_por?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    paciente_cancelada?: StringNullableWithAggregatesFilter<"agenda"> | string | null
    fecha_cancelada?: DateTimeNullableWithAggregatesFilter<"agenda"> | Date | string | null
  }

  export type usuariosWhereInput = {
    AND?: usuariosWhereInput | usuariosWhereInput[]
    OR?: usuariosWhereInput[]
    NOT?: usuariosWhereInput | usuariosWhereInput[]
    Carnet?: StringFilter<"usuarios"> | string
    codPrestador?: StringNullableFilter<"usuarios"> | string | null
    Identificaci_n_usuario?: StringFilter<"usuarios"> | string
    Tipo_identificaci_n?: StringFilter<"usuarios"> | string
    Primer_apellido?: StringFilter<"usuarios"> | string
    Segundo_apellido?: StringNullableFilter<"usuarios"> | string | null
    Primer_nombre?: StringFilter<"usuarios"> | string
    Segundo_nombre?: StringNullableFilter<"usuarios"> | string | null
    Direcci_n?: StringNullableFilter<"usuarios"> | string | null
    Tel_fono?: StringNullableFilter<"usuarios"> | string | null
    Tipo_usuario?: StringFilter<"usuarios"> | string
    Tipo_afiliado?: StringNullableFilter<"usuarios"> | string | null
    C_digo_Ocupaci_n?: StringNullableFilter<"usuarios"> | string | null
    Unidad_edad?: StringFilter<"usuarios"> | string
    Edad?: StringFilter<"usuarios"> | string
    Sexo?: StringFilter<"usuarios"> | string
    Residencia?: StringFilter<"usuarios"> | string
    Zona_residencia?: StringFilter<"usuarios"> | string
    cedula_afiliado?: StringNullableFilter<"usuarios"> | string | null
    Fecha_nacimient?: DateTimeNullableFilter<"usuarios"> | Date | string | null
    NHistoria?: StringNullableFilter<"usuarios"> | string | null
    Estado_civil?: StringNullableFilter<"usuarios"> | string | null
    Estado?: StringNullableFilter<"usuarios"> | string | null
    fecha_retiro?: DateTimeNullableFilter<"usuarios"> | Date | string | null
    Ciudad?: StringNullableFilter<"usuarios"> | string | null
    Sector?: StringFilter<"usuarios"> | string
    Nombre_acudiente?: StringNullableFilter<"usuarios"> | string | null
    Telefono_acudiente?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Patologico1?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Patologico2?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Patologico3?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Quirurgico1?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Quirurgico2?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Familiar1?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Familiar2?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Familiar3?: StringNullableFilter<"usuarios"> | string | null
    Hemoclasificaci_n?: StringNullableFilter<"usuarios"> | string | null
    RH?: StringNullableFilter<"usuarios"> | string | null
    Fecha_afiliacion?: DateTimeNullableFilter<"usuarios"> | Date | string | null
    Parentezco?: StringNullableFilter<"usuarios"> | string | null
    Ciudad_cedula?: StringNullableFilter<"usuarios"> | string | null
    Escalafon_afiliado?: StringNullableFilter<"usuarios"> | string | null
    Discapacidad?: StringNullableFilter<"usuarios"> | string | null
    Estrato?: StringNullableFilter<"usuarios"> | string | null
    AL1?: IntNullableFilter<"usuarios"> | number | null
    AL2?: IntNullableFilter<"usuarios"> | number | null
    Cod_medico?: StringNullableFilter<"usuarios"> | string | null
    Codigo_eps?: StringFilter<"usuarios"> | string
    Rango?: StringNullableFilter<"usuarios"> | string | null
    Pagos?: StringNullableFilter<"usuarios"> | string | null
    Cod_odontologo?: StringNullableFilter<"usuarios"> | string | null
    Fecha_novedad?: DateTimeNullableFilter<"usuarios"> | Date | string | null
    Contrato?: StringNullableFilter<"usuarios"> | string | null
    N_mero_afiliaci_n?: StringNullableFilter<"usuarios"> | string | null
    Etnico?: StringNullableFilter<"usuarios"> | string | null
    NumeroSemanasCotizadas?: IntNullableFilter<"usuarios"> | number | null
    LugarNacimiento?: StringNullableFilter<"usuarios"> | string | null
    NroHijos?: IntNullableFilter<"usuarios"> | number | null
    Escolaridad?: StringNullableFilter<"usuarios"> | string | null
    FechaAfiliacion?: DateTimeNullableFilter<"usuarios"> | Date | string | null
    Celular?: StringNullableFilter<"usuarios"> | string | null
    CorreoElectr_nico?: StringNullableFilter<"usuarios"> | string | null
    Responsable?: StringNullableFilter<"usuarios"> | string | null
    Telefono_Responsable?: StringNullableFilter<"usuarios"> | string | null
    Religion?: StringNullableFilter<"usuarios"> | string | null
    Telefono_Secundario?: StringNullableFilter<"usuarios"> | string | null
    email?: StringNullableFilter<"usuarios"> | string | null
    Fecha_Creado?: StringNullableFilter<"usuarios"> | string | null
    Creado_Por?: StringNullableFilter<"usuarios"> | string | null
    Fecha_Modificado?: StringNullableFilter<"usuarios"> | string | null
    Modificado_por?: StringNullableFilter<"usuarios"> | string | null
    Fecha_Estado?: StringNullableFilter<"usuarios"> | string | null
    Portabilidad?: StringNullableFilter<"usuarios"> | string | null
    Fecha_Portabilidad?: StringNullableFilter<"usuarios"> | string | null
    nombre_disp_asignado?: StringNullableFilter<"usuarios"> | string | null
    Genero?: StringNullableFilter<"usuarios"> | string | null
    Poblacion_Clave?: StringNullableFilter<"usuarios"> | string | null
    Gestacion?: StringNullableFilter<"usuarios"> | string | null
    Victima_del_Conflicto_armado?: StringNullableFilter<"usuarios"> | string | null
    VICTIMA_DEL_MALTRATO?: StringNullableFilter<"usuarios"> | string | null
    ABANDONO_SOCIAL?: StringNullableFilter<"usuarios"> | string | null
    DESESCOLARIZADO?: StringNullableFilter<"usuarios"> | string | null
    DESEMPLEADO?: StringNullableFilter<"usuarios"> | string | null
    CARCELARIO?: StringNullableFilter<"usuarios"> | string | null
    MIGRANTE?: StringNullableFilter<"usuarios"> | string | null
    TRABAJADORA_SEXUAL?: StringNullableFilter<"usuarios"> | string | null
    POBLACION_LGTBI?: StringNullableFilter<"usuarios"> | string | null
    ORIENTACION_SEXUAL?: StringNullableFilter<"usuarios"> | string | null
    Barrio?: StringNullableFilter<"usuarios"> | string | null
    confirmacion_telefono?: StringNullableFilter<"usuarios"> | string | null
    poll?: StringNullableFilter<"usuarios"> | string | null
    Clave?: StringNullableFilter<"usuarios"> | string | null
    codPaisResidencia?: StringNullableFilter<"usuarios"> | string | null
    codMunicipioResidencia?: StringNullableFilter<"usuarios"> | string | null
    codDepartamentoResidencia?: StringNullableFilter<"usuarios"> | string | null
    codPaisOrigen?: StringNullableFilter<"usuarios"> | string | null
    codZonaTerritorialResidencia?: StringNullableFilter<"usuarios"> | string | null
    incapacidad?: StringNullableFilter<"usuarios"> | string | null
    Capitado?: Enumusuarios_CapitadoNullableFilter<"usuarios"> | $Enums.usuarios_Capitado | null
    IdUsuario?: IntFilter<"usuarios"> | number
    IdCentro?: IntNullableFilter<"usuarios"> | number | null
    vacunas_completas?: StringNullableFilter<"usuarios"> | string | null
    intervenciones_quirurgicas?: StringNullableFilter<"usuarios"> | string | null
    alergia?: StringNullableFilter<"usuarios"> | string | null
  }

  export type usuariosOrderByWithRelationInput = {
    Carnet?: SortOrder
    codPrestador?: SortOrderInput | SortOrder
    Identificaci_n_usuario?: SortOrder
    Tipo_identificaci_n?: SortOrder
    Primer_apellido?: SortOrder
    Segundo_apellido?: SortOrderInput | SortOrder
    Primer_nombre?: SortOrder
    Segundo_nombre?: SortOrderInput | SortOrder
    Direcci_n?: SortOrderInput | SortOrder
    Tel_fono?: SortOrderInput | SortOrder
    Tipo_usuario?: SortOrder
    Tipo_afiliado?: SortOrderInput | SortOrder
    C_digo_Ocupaci_n?: SortOrderInput | SortOrder
    Unidad_edad?: SortOrder
    Edad?: SortOrder
    Sexo?: SortOrder
    Residencia?: SortOrder
    Zona_residencia?: SortOrder
    cedula_afiliado?: SortOrderInput | SortOrder
    Fecha_nacimient?: SortOrderInput | SortOrder
    NHistoria?: SortOrderInput | SortOrder
    Estado_civil?: SortOrderInput | SortOrder
    Estado?: SortOrderInput | SortOrder
    fecha_retiro?: SortOrderInput | SortOrder
    Ciudad?: SortOrderInput | SortOrder
    Sector?: SortOrder
    Nombre_acudiente?: SortOrderInput | SortOrder
    Telefono_acudiente?: SortOrderInput | SortOrder
    Antecedente_Patologico1?: SortOrderInput | SortOrder
    Antecedente_Patologico2?: SortOrderInput | SortOrder
    Antecedente_Patologico3?: SortOrderInput | SortOrder
    Antecedente_Quirurgico1?: SortOrderInput | SortOrder
    Antecedente_Quirurgico2?: SortOrderInput | SortOrder
    Antecedente_Familiar1?: SortOrderInput | SortOrder
    Antecedente_Familiar2?: SortOrderInput | SortOrder
    Antecedente_Familiar3?: SortOrderInput | SortOrder
    Hemoclasificaci_n?: SortOrderInput | SortOrder
    RH?: SortOrderInput | SortOrder
    Fecha_afiliacion?: SortOrderInput | SortOrder
    Parentezco?: SortOrderInput | SortOrder
    Ciudad_cedula?: SortOrderInput | SortOrder
    Escalafon_afiliado?: SortOrderInput | SortOrder
    Discapacidad?: SortOrderInput | SortOrder
    Estrato?: SortOrderInput | SortOrder
    AL1?: SortOrderInput | SortOrder
    AL2?: SortOrderInput | SortOrder
    Cod_medico?: SortOrderInput | SortOrder
    Codigo_eps?: SortOrder
    Rango?: SortOrderInput | SortOrder
    Pagos?: SortOrderInput | SortOrder
    Cod_odontologo?: SortOrderInput | SortOrder
    Fecha_novedad?: SortOrderInput | SortOrder
    Contrato?: SortOrderInput | SortOrder
    N_mero_afiliaci_n?: SortOrderInput | SortOrder
    Etnico?: SortOrderInput | SortOrder
    NumeroSemanasCotizadas?: SortOrderInput | SortOrder
    LugarNacimiento?: SortOrderInput | SortOrder
    NroHijos?: SortOrderInput | SortOrder
    Escolaridad?: SortOrderInput | SortOrder
    FechaAfiliacion?: SortOrderInput | SortOrder
    Celular?: SortOrderInput | SortOrder
    CorreoElectr_nico?: SortOrderInput | SortOrder
    Responsable?: SortOrderInput | SortOrder
    Telefono_Responsable?: SortOrderInput | SortOrder
    Religion?: SortOrderInput | SortOrder
    Telefono_Secundario?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    Fecha_Creado?: SortOrderInput | SortOrder
    Creado_Por?: SortOrderInput | SortOrder
    Fecha_Modificado?: SortOrderInput | SortOrder
    Modificado_por?: SortOrderInput | SortOrder
    Fecha_Estado?: SortOrderInput | SortOrder
    Portabilidad?: SortOrderInput | SortOrder
    Fecha_Portabilidad?: SortOrderInput | SortOrder
    nombre_disp_asignado?: SortOrderInput | SortOrder
    Genero?: SortOrderInput | SortOrder
    Poblacion_Clave?: SortOrderInput | SortOrder
    Gestacion?: SortOrderInput | SortOrder
    Victima_del_Conflicto_armado?: SortOrderInput | SortOrder
    VICTIMA_DEL_MALTRATO?: SortOrderInput | SortOrder
    ABANDONO_SOCIAL?: SortOrderInput | SortOrder
    DESESCOLARIZADO?: SortOrderInput | SortOrder
    DESEMPLEADO?: SortOrderInput | SortOrder
    CARCELARIO?: SortOrderInput | SortOrder
    MIGRANTE?: SortOrderInput | SortOrder
    TRABAJADORA_SEXUAL?: SortOrderInput | SortOrder
    POBLACION_LGTBI?: SortOrderInput | SortOrder
    ORIENTACION_SEXUAL?: SortOrderInput | SortOrder
    Barrio?: SortOrderInput | SortOrder
    confirmacion_telefono?: SortOrderInput | SortOrder
    poll?: SortOrderInput | SortOrder
    Clave?: SortOrderInput | SortOrder
    codPaisResidencia?: SortOrderInput | SortOrder
    codMunicipioResidencia?: SortOrderInput | SortOrder
    codDepartamentoResidencia?: SortOrderInput | SortOrder
    codPaisOrigen?: SortOrderInput | SortOrder
    codZonaTerritorialResidencia?: SortOrderInput | SortOrder
    incapacidad?: SortOrderInput | SortOrder
    Capitado?: SortOrderInput | SortOrder
    IdUsuario?: SortOrder
    IdCentro?: SortOrderInput | SortOrder
    vacunas_completas?: SortOrderInput | SortOrder
    intervenciones_quirurgicas?: SortOrderInput | SortOrder
    alergia?: SortOrderInput | SortOrder
    _relevance?: usuariosOrderByRelevanceInput
  }

  export type usuariosWhereUniqueInput = Prisma.AtLeast<{
    IdUsuario?: number
    Identificaci_n_usuario_Tipo_identificaci_n?: usuariosIdentificaci_n_usuarioTipo_identificaci_nCompoundUniqueInput
    AND?: usuariosWhereInput | usuariosWhereInput[]
    OR?: usuariosWhereInput[]
    NOT?: usuariosWhereInput | usuariosWhereInput[]
    Carnet?: StringFilter<"usuarios"> | string
    codPrestador?: StringNullableFilter<"usuarios"> | string | null
    Identificaci_n_usuario?: StringFilter<"usuarios"> | string
    Tipo_identificaci_n?: StringFilter<"usuarios"> | string
    Primer_apellido?: StringFilter<"usuarios"> | string
    Segundo_apellido?: StringNullableFilter<"usuarios"> | string | null
    Primer_nombre?: StringFilter<"usuarios"> | string
    Segundo_nombre?: StringNullableFilter<"usuarios"> | string | null
    Direcci_n?: StringNullableFilter<"usuarios"> | string | null
    Tel_fono?: StringNullableFilter<"usuarios"> | string | null
    Tipo_usuario?: StringFilter<"usuarios"> | string
    Tipo_afiliado?: StringNullableFilter<"usuarios"> | string | null
    C_digo_Ocupaci_n?: StringNullableFilter<"usuarios"> | string | null
    Unidad_edad?: StringFilter<"usuarios"> | string
    Edad?: StringFilter<"usuarios"> | string
    Sexo?: StringFilter<"usuarios"> | string
    Residencia?: StringFilter<"usuarios"> | string
    Zona_residencia?: StringFilter<"usuarios"> | string
    cedula_afiliado?: StringNullableFilter<"usuarios"> | string | null
    Fecha_nacimient?: DateTimeNullableFilter<"usuarios"> | Date | string | null
    NHistoria?: StringNullableFilter<"usuarios"> | string | null
    Estado_civil?: StringNullableFilter<"usuarios"> | string | null
    Estado?: StringNullableFilter<"usuarios"> | string | null
    fecha_retiro?: DateTimeNullableFilter<"usuarios"> | Date | string | null
    Ciudad?: StringNullableFilter<"usuarios"> | string | null
    Sector?: StringFilter<"usuarios"> | string
    Nombre_acudiente?: StringNullableFilter<"usuarios"> | string | null
    Telefono_acudiente?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Patologico1?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Patologico2?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Patologico3?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Quirurgico1?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Quirurgico2?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Familiar1?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Familiar2?: StringNullableFilter<"usuarios"> | string | null
    Antecedente_Familiar3?: StringNullableFilter<"usuarios"> | string | null
    Hemoclasificaci_n?: StringNullableFilter<"usuarios"> | string | null
    RH?: StringNullableFilter<"usuarios"> | string | null
    Fecha_afiliacion?: DateTimeNullableFilter<"usuarios"> | Date | string | null
    Parentezco?: StringNullableFilter<"usuarios"> | string | null
    Ciudad_cedula?: StringNullableFilter<"usuarios"> | string | null
    Escalafon_afiliado?: StringNullableFilter<"usuarios"> | string | null
    Discapacidad?: StringNullableFilter<"usuarios"> | string | null
    Estrato?: StringNullableFilter<"usuarios"> | string | null
    AL1?: IntNullableFilter<"usuarios"> | number | null
    AL2?: IntNullableFilter<"usuarios"> | number | null
    Cod_medico?: StringNullableFilter<"usuarios"> | string | null
    Codigo_eps?: StringFilter<"usuarios"> | string
    Rango?: StringNullableFilter<"usuarios"> | string | null
    Pagos?: StringNullableFilter<"usuarios"> | string | null
    Cod_odontologo?: StringNullableFilter<"usuarios"> | string | null
    Fecha_novedad?: DateTimeNullableFilter<"usuarios"> | Date | string | null
    Contrato?: StringNullableFilter<"usuarios"> | string | null
    N_mero_afiliaci_n?: StringNullableFilter<"usuarios"> | string | null
    Etnico?: StringNullableFilter<"usuarios"> | string | null
    NumeroSemanasCotizadas?: IntNullableFilter<"usuarios"> | number | null
    LugarNacimiento?: StringNullableFilter<"usuarios"> | string | null
    NroHijos?: IntNullableFilter<"usuarios"> | number | null
    Escolaridad?: StringNullableFilter<"usuarios"> | string | null
    FechaAfiliacion?: DateTimeNullableFilter<"usuarios"> | Date | string | null
    Celular?: StringNullableFilter<"usuarios"> | string | null
    CorreoElectr_nico?: StringNullableFilter<"usuarios"> | string | null
    Responsable?: StringNullableFilter<"usuarios"> | string | null
    Telefono_Responsable?: StringNullableFilter<"usuarios"> | string | null
    Religion?: StringNullableFilter<"usuarios"> | string | null
    Telefono_Secundario?: StringNullableFilter<"usuarios"> | string | null
    email?: StringNullableFilter<"usuarios"> | string | null
    Fecha_Creado?: StringNullableFilter<"usuarios"> | string | null
    Creado_Por?: StringNullableFilter<"usuarios"> | string | null
    Fecha_Modificado?: StringNullableFilter<"usuarios"> | string | null
    Modificado_por?: StringNullableFilter<"usuarios"> | string | null
    Fecha_Estado?: StringNullableFilter<"usuarios"> | string | null
    Portabilidad?: StringNullableFilter<"usuarios"> | string | null
    Fecha_Portabilidad?: StringNullableFilter<"usuarios"> | string | null
    nombre_disp_asignado?: StringNullableFilter<"usuarios"> | string | null
    Genero?: StringNullableFilter<"usuarios"> | string | null
    Poblacion_Clave?: StringNullableFilter<"usuarios"> | string | null
    Gestacion?: StringNullableFilter<"usuarios"> | string | null
    Victima_del_Conflicto_armado?: StringNullableFilter<"usuarios"> | string | null
    VICTIMA_DEL_MALTRATO?: StringNullableFilter<"usuarios"> | string | null
    ABANDONO_SOCIAL?: StringNullableFilter<"usuarios"> | string | null
    DESESCOLARIZADO?: StringNullableFilter<"usuarios"> | string | null
    DESEMPLEADO?: StringNullableFilter<"usuarios"> | string | null
    CARCELARIO?: StringNullableFilter<"usuarios"> | string | null
    MIGRANTE?: StringNullableFilter<"usuarios"> | string | null
    TRABAJADORA_SEXUAL?: StringNullableFilter<"usuarios"> | string | null
    POBLACION_LGTBI?: StringNullableFilter<"usuarios"> | string | null
    ORIENTACION_SEXUAL?: StringNullableFilter<"usuarios"> | string | null
    Barrio?: StringNullableFilter<"usuarios"> | string | null
    confirmacion_telefono?: StringNullableFilter<"usuarios"> | string | null
    poll?: StringNullableFilter<"usuarios"> | string | null
    Clave?: StringNullableFilter<"usuarios"> | string | null
    codPaisResidencia?: StringNullableFilter<"usuarios"> | string | null
    codMunicipioResidencia?: StringNullableFilter<"usuarios"> | string | null
    codDepartamentoResidencia?: StringNullableFilter<"usuarios"> | string | null
    codPaisOrigen?: StringNullableFilter<"usuarios"> | string | null
    codZonaTerritorialResidencia?: StringNullableFilter<"usuarios"> | string | null
    incapacidad?: StringNullableFilter<"usuarios"> | string | null
    Capitado?: Enumusuarios_CapitadoNullableFilter<"usuarios"> | $Enums.usuarios_Capitado | null
    IdCentro?: IntNullableFilter<"usuarios"> | number | null
    vacunas_completas?: StringNullableFilter<"usuarios"> | string | null
    intervenciones_quirurgicas?: StringNullableFilter<"usuarios"> | string | null
    alergia?: StringNullableFilter<"usuarios"> | string | null
  }, "IdUsuario" | "Identificaci_n_usuario_Tipo_identificaci_n">

  export type usuariosOrderByWithAggregationInput = {
    Carnet?: SortOrder
    codPrestador?: SortOrderInput | SortOrder
    Identificaci_n_usuario?: SortOrder
    Tipo_identificaci_n?: SortOrder
    Primer_apellido?: SortOrder
    Segundo_apellido?: SortOrderInput | SortOrder
    Primer_nombre?: SortOrder
    Segundo_nombre?: SortOrderInput | SortOrder
    Direcci_n?: SortOrderInput | SortOrder
    Tel_fono?: SortOrderInput | SortOrder
    Tipo_usuario?: SortOrder
    Tipo_afiliado?: SortOrderInput | SortOrder
    C_digo_Ocupaci_n?: SortOrderInput | SortOrder
    Unidad_edad?: SortOrder
    Edad?: SortOrder
    Sexo?: SortOrder
    Residencia?: SortOrder
    Zona_residencia?: SortOrder
    cedula_afiliado?: SortOrderInput | SortOrder
    Fecha_nacimient?: SortOrderInput | SortOrder
    NHistoria?: SortOrderInput | SortOrder
    Estado_civil?: SortOrderInput | SortOrder
    Estado?: SortOrderInput | SortOrder
    fecha_retiro?: SortOrderInput | SortOrder
    Ciudad?: SortOrderInput | SortOrder
    Sector?: SortOrder
    Nombre_acudiente?: SortOrderInput | SortOrder
    Telefono_acudiente?: SortOrderInput | SortOrder
    Antecedente_Patologico1?: SortOrderInput | SortOrder
    Antecedente_Patologico2?: SortOrderInput | SortOrder
    Antecedente_Patologico3?: SortOrderInput | SortOrder
    Antecedente_Quirurgico1?: SortOrderInput | SortOrder
    Antecedente_Quirurgico2?: SortOrderInput | SortOrder
    Antecedente_Familiar1?: SortOrderInput | SortOrder
    Antecedente_Familiar2?: SortOrderInput | SortOrder
    Antecedente_Familiar3?: SortOrderInput | SortOrder
    Hemoclasificaci_n?: SortOrderInput | SortOrder
    RH?: SortOrderInput | SortOrder
    Fecha_afiliacion?: SortOrderInput | SortOrder
    Parentezco?: SortOrderInput | SortOrder
    Ciudad_cedula?: SortOrderInput | SortOrder
    Escalafon_afiliado?: SortOrderInput | SortOrder
    Discapacidad?: SortOrderInput | SortOrder
    Estrato?: SortOrderInput | SortOrder
    AL1?: SortOrderInput | SortOrder
    AL2?: SortOrderInput | SortOrder
    Cod_medico?: SortOrderInput | SortOrder
    Codigo_eps?: SortOrder
    Rango?: SortOrderInput | SortOrder
    Pagos?: SortOrderInput | SortOrder
    Cod_odontologo?: SortOrderInput | SortOrder
    Fecha_novedad?: SortOrderInput | SortOrder
    Contrato?: SortOrderInput | SortOrder
    N_mero_afiliaci_n?: SortOrderInput | SortOrder
    Etnico?: SortOrderInput | SortOrder
    NumeroSemanasCotizadas?: SortOrderInput | SortOrder
    LugarNacimiento?: SortOrderInput | SortOrder
    NroHijos?: SortOrderInput | SortOrder
    Escolaridad?: SortOrderInput | SortOrder
    FechaAfiliacion?: SortOrderInput | SortOrder
    Celular?: SortOrderInput | SortOrder
    CorreoElectr_nico?: SortOrderInput | SortOrder
    Responsable?: SortOrderInput | SortOrder
    Telefono_Responsable?: SortOrderInput | SortOrder
    Religion?: SortOrderInput | SortOrder
    Telefono_Secundario?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    Fecha_Creado?: SortOrderInput | SortOrder
    Creado_Por?: SortOrderInput | SortOrder
    Fecha_Modificado?: SortOrderInput | SortOrder
    Modificado_por?: SortOrderInput | SortOrder
    Fecha_Estado?: SortOrderInput | SortOrder
    Portabilidad?: SortOrderInput | SortOrder
    Fecha_Portabilidad?: SortOrderInput | SortOrder
    nombre_disp_asignado?: SortOrderInput | SortOrder
    Genero?: SortOrderInput | SortOrder
    Poblacion_Clave?: SortOrderInput | SortOrder
    Gestacion?: SortOrderInput | SortOrder
    Victima_del_Conflicto_armado?: SortOrderInput | SortOrder
    VICTIMA_DEL_MALTRATO?: SortOrderInput | SortOrder
    ABANDONO_SOCIAL?: SortOrderInput | SortOrder
    DESESCOLARIZADO?: SortOrderInput | SortOrder
    DESEMPLEADO?: SortOrderInput | SortOrder
    CARCELARIO?: SortOrderInput | SortOrder
    MIGRANTE?: SortOrderInput | SortOrder
    TRABAJADORA_SEXUAL?: SortOrderInput | SortOrder
    POBLACION_LGTBI?: SortOrderInput | SortOrder
    ORIENTACION_SEXUAL?: SortOrderInput | SortOrder
    Barrio?: SortOrderInput | SortOrder
    confirmacion_telefono?: SortOrderInput | SortOrder
    poll?: SortOrderInput | SortOrder
    Clave?: SortOrderInput | SortOrder
    codPaisResidencia?: SortOrderInput | SortOrder
    codMunicipioResidencia?: SortOrderInput | SortOrder
    codDepartamentoResidencia?: SortOrderInput | SortOrder
    codPaisOrigen?: SortOrderInput | SortOrder
    codZonaTerritorialResidencia?: SortOrderInput | SortOrder
    incapacidad?: SortOrderInput | SortOrder
    Capitado?: SortOrderInput | SortOrder
    IdUsuario?: SortOrder
    IdCentro?: SortOrderInput | SortOrder
    vacunas_completas?: SortOrderInput | SortOrder
    intervenciones_quirurgicas?: SortOrderInput | SortOrder
    alergia?: SortOrderInput | SortOrder
    _count?: usuariosCountOrderByAggregateInput
    _avg?: usuariosAvgOrderByAggregateInput
    _max?: usuariosMaxOrderByAggregateInput
    _min?: usuariosMinOrderByAggregateInput
    _sum?: usuariosSumOrderByAggregateInput
  }

  export type usuariosScalarWhereWithAggregatesInput = {
    AND?: usuariosScalarWhereWithAggregatesInput | usuariosScalarWhereWithAggregatesInput[]
    OR?: usuariosScalarWhereWithAggregatesInput[]
    NOT?: usuariosScalarWhereWithAggregatesInput | usuariosScalarWhereWithAggregatesInput[]
    Carnet?: StringWithAggregatesFilter<"usuarios"> | string
    codPrestador?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Identificaci_n_usuario?: StringWithAggregatesFilter<"usuarios"> | string
    Tipo_identificaci_n?: StringWithAggregatesFilter<"usuarios"> | string
    Primer_apellido?: StringWithAggregatesFilter<"usuarios"> | string
    Segundo_apellido?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Primer_nombre?: StringWithAggregatesFilter<"usuarios"> | string
    Segundo_nombre?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Direcci_n?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Tel_fono?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Tipo_usuario?: StringWithAggregatesFilter<"usuarios"> | string
    Tipo_afiliado?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    C_digo_Ocupaci_n?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Unidad_edad?: StringWithAggregatesFilter<"usuarios"> | string
    Edad?: StringWithAggregatesFilter<"usuarios"> | string
    Sexo?: StringWithAggregatesFilter<"usuarios"> | string
    Residencia?: StringWithAggregatesFilter<"usuarios"> | string
    Zona_residencia?: StringWithAggregatesFilter<"usuarios"> | string
    cedula_afiliado?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Fecha_nacimient?: DateTimeNullableWithAggregatesFilter<"usuarios"> | Date | string | null
    NHistoria?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Estado_civil?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Estado?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    fecha_retiro?: DateTimeNullableWithAggregatesFilter<"usuarios"> | Date | string | null
    Ciudad?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Sector?: StringWithAggregatesFilter<"usuarios"> | string
    Nombre_acudiente?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Telefono_acudiente?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Antecedente_Patologico1?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Antecedente_Patologico2?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Antecedente_Patologico3?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Antecedente_Quirurgico1?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Antecedente_Quirurgico2?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Antecedente_Familiar1?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Antecedente_Familiar2?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Antecedente_Familiar3?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Hemoclasificaci_n?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    RH?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Fecha_afiliacion?: DateTimeNullableWithAggregatesFilter<"usuarios"> | Date | string | null
    Parentezco?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Ciudad_cedula?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Escalafon_afiliado?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Discapacidad?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Estrato?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    AL1?: IntNullableWithAggregatesFilter<"usuarios"> | number | null
    AL2?: IntNullableWithAggregatesFilter<"usuarios"> | number | null
    Cod_medico?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Codigo_eps?: StringWithAggregatesFilter<"usuarios"> | string
    Rango?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Pagos?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Cod_odontologo?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Fecha_novedad?: DateTimeNullableWithAggregatesFilter<"usuarios"> | Date | string | null
    Contrato?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    N_mero_afiliaci_n?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Etnico?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    NumeroSemanasCotizadas?: IntNullableWithAggregatesFilter<"usuarios"> | number | null
    LugarNacimiento?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    NroHijos?: IntNullableWithAggregatesFilter<"usuarios"> | number | null
    Escolaridad?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    FechaAfiliacion?: DateTimeNullableWithAggregatesFilter<"usuarios"> | Date | string | null
    Celular?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    CorreoElectr_nico?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Responsable?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Telefono_Responsable?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Religion?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Telefono_Secundario?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    email?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Fecha_Creado?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Creado_Por?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Fecha_Modificado?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Modificado_por?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Fecha_Estado?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Portabilidad?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Fecha_Portabilidad?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    nombre_disp_asignado?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Genero?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Poblacion_Clave?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Gestacion?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Victima_del_Conflicto_armado?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    VICTIMA_DEL_MALTRATO?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    ABANDONO_SOCIAL?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    DESESCOLARIZADO?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    DESEMPLEADO?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    CARCELARIO?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    MIGRANTE?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    TRABAJADORA_SEXUAL?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    POBLACION_LGTBI?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    ORIENTACION_SEXUAL?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Barrio?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    confirmacion_telefono?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    poll?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Clave?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    codPaisResidencia?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    codMunicipioResidencia?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    codDepartamentoResidencia?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    codPaisOrigen?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    codZonaTerritorialResidencia?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    incapacidad?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    Capitado?: Enumusuarios_CapitadoNullableWithAggregatesFilter<"usuarios"> | $Enums.usuarios_Capitado | null
    IdUsuario?: IntWithAggregatesFilter<"usuarios"> | number
    IdCentro?: IntNullableWithAggregatesFilter<"usuarios"> | number | null
    vacunas_completas?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    intervenciones_quirurgicas?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
    alergia?: StringNullableWithAggregatesFilter<"usuarios"> | string | null
  }

  export type empleadosWhereInput = {
    AND?: empleadosWhereInput | empleadosWhereInput[]
    OR?: empleadosWhereInput[]
    NOT?: empleadosWhereInput | empleadosWhereInput[]
    C_digo_empleado?: StringFilter<"empleados"> | string
    Nombre_empleado?: StringFilter<"empleados"> | string
    Direcci_n?: StringNullableFilter<"empleados"> | string | null
    Tel_fonos?: StringNullableFilter<"empleados"> | string | null
    Medico?: BoolNullableFilter<"empleados"> | boolean | null
    EsMedico?: BoolFilter<"empleados"> | boolean
    Odontologo?: BoolNullableFilter<"empleados"> | boolean | null
    Clave?: StringNullableFilter<"empleados"> | string | null
    Estado_Empleado?: BoolNullableFilter<"empleados"> | boolean | null
    POtraEsp?: BoolNullableFilter<"empleados"> | boolean | null
    Registro_medico?: StringNullableFilter<"empleados"> | string | null
    De?: StringNullableFilter<"empleados"> | string | null
    Firma?: StringNullableFilter<"empleados"> | string | null
    Registra?: BoolNullableFilter<"empleados"> | boolean | null
    enfermeria?: BoolNullableFilter<"empleados"> | boolean | null
    Perfil?: IntNullableFilter<"empleados"> | number | null
    Perfil2?: IntNullableFilter<"empleados"> | number | null
    phone?: StringNullableFilter<"empleados"> | string | null
    Firmaimg?: BytesFilter<"empleados"> | Uint8Array
    consultorio?: StringNullableFilter<"empleados"> | string | null
    email?: StringNullableFilter<"empleados"> | string | null
    IdCentro?: IntNullableFilter<"empleados"> | number | null
    userpic?: BytesNullableFilter<"empleados"> | Uint8Array | null
    TipoDocumento?: StringNullableFilter<"empleados"> | string | null
    Documento?: StringNullableFilter<"empleados"> | string | null
  }

  export type empleadosOrderByWithRelationInput = {
    C_digo_empleado?: SortOrder
    Nombre_empleado?: SortOrder
    Direcci_n?: SortOrderInput | SortOrder
    Tel_fonos?: SortOrderInput | SortOrder
    Medico?: SortOrderInput | SortOrder
    EsMedico?: SortOrder
    Odontologo?: SortOrderInput | SortOrder
    Clave?: SortOrderInput | SortOrder
    Estado_Empleado?: SortOrderInput | SortOrder
    POtraEsp?: SortOrderInput | SortOrder
    Registro_medico?: SortOrderInput | SortOrder
    De?: SortOrderInput | SortOrder
    Firma?: SortOrderInput | SortOrder
    Registra?: SortOrderInput | SortOrder
    enfermeria?: SortOrderInput | SortOrder
    Perfil?: SortOrderInput | SortOrder
    Perfil2?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    Firmaimg?: SortOrder
    consultorio?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    IdCentro?: SortOrderInput | SortOrder
    userpic?: SortOrderInput | SortOrder
    TipoDocumento?: SortOrderInput | SortOrder
    Documento?: SortOrderInput | SortOrder
    _relevance?: empleadosOrderByRelevanceInput
  }

  export type empleadosWhereUniqueInput = Prisma.AtLeast<{
    C_digo_empleado?: string
    AND?: empleadosWhereInput | empleadosWhereInput[]
    OR?: empleadosWhereInput[]
    NOT?: empleadosWhereInput | empleadosWhereInput[]
    Nombre_empleado?: StringFilter<"empleados"> | string
    Direcci_n?: StringNullableFilter<"empleados"> | string | null
    Tel_fonos?: StringNullableFilter<"empleados"> | string | null
    Medico?: BoolNullableFilter<"empleados"> | boolean | null
    EsMedico?: BoolFilter<"empleados"> | boolean
    Odontologo?: BoolNullableFilter<"empleados"> | boolean | null
    Clave?: StringNullableFilter<"empleados"> | string | null
    Estado_Empleado?: BoolNullableFilter<"empleados"> | boolean | null
    POtraEsp?: BoolNullableFilter<"empleados"> | boolean | null
    Registro_medico?: StringNullableFilter<"empleados"> | string | null
    De?: StringNullableFilter<"empleados"> | string | null
    Firma?: StringNullableFilter<"empleados"> | string | null
    Registra?: BoolNullableFilter<"empleados"> | boolean | null
    enfermeria?: BoolNullableFilter<"empleados"> | boolean | null
    Perfil?: IntNullableFilter<"empleados"> | number | null
    Perfil2?: IntNullableFilter<"empleados"> | number | null
    phone?: StringNullableFilter<"empleados"> | string | null
    Firmaimg?: BytesFilter<"empleados"> | Uint8Array
    consultorio?: StringNullableFilter<"empleados"> | string | null
    email?: StringNullableFilter<"empleados"> | string | null
    IdCentro?: IntNullableFilter<"empleados"> | number | null
    userpic?: BytesNullableFilter<"empleados"> | Uint8Array | null
    TipoDocumento?: StringNullableFilter<"empleados"> | string | null
    Documento?: StringNullableFilter<"empleados"> | string | null
  }, "C_digo_empleado">

  export type empleadosOrderByWithAggregationInput = {
    C_digo_empleado?: SortOrder
    Nombre_empleado?: SortOrder
    Direcci_n?: SortOrderInput | SortOrder
    Tel_fonos?: SortOrderInput | SortOrder
    Medico?: SortOrderInput | SortOrder
    EsMedico?: SortOrder
    Odontologo?: SortOrderInput | SortOrder
    Clave?: SortOrderInput | SortOrder
    Estado_Empleado?: SortOrderInput | SortOrder
    POtraEsp?: SortOrderInput | SortOrder
    Registro_medico?: SortOrderInput | SortOrder
    De?: SortOrderInput | SortOrder
    Firma?: SortOrderInput | SortOrder
    Registra?: SortOrderInput | SortOrder
    enfermeria?: SortOrderInput | SortOrder
    Perfil?: SortOrderInput | SortOrder
    Perfil2?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    Firmaimg?: SortOrder
    consultorio?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    IdCentro?: SortOrderInput | SortOrder
    userpic?: SortOrderInput | SortOrder
    TipoDocumento?: SortOrderInput | SortOrder
    Documento?: SortOrderInput | SortOrder
    _count?: empleadosCountOrderByAggregateInput
    _avg?: empleadosAvgOrderByAggregateInput
    _max?: empleadosMaxOrderByAggregateInput
    _min?: empleadosMinOrderByAggregateInput
    _sum?: empleadosSumOrderByAggregateInput
  }

  export type empleadosScalarWhereWithAggregatesInput = {
    AND?: empleadosScalarWhereWithAggregatesInput | empleadosScalarWhereWithAggregatesInput[]
    OR?: empleadosScalarWhereWithAggregatesInput[]
    NOT?: empleadosScalarWhereWithAggregatesInput | empleadosScalarWhereWithAggregatesInput[]
    C_digo_empleado?: StringWithAggregatesFilter<"empleados"> | string
    Nombre_empleado?: StringWithAggregatesFilter<"empleados"> | string
    Direcci_n?: StringNullableWithAggregatesFilter<"empleados"> | string | null
    Tel_fonos?: StringNullableWithAggregatesFilter<"empleados"> | string | null
    Medico?: BoolNullableWithAggregatesFilter<"empleados"> | boolean | null
    EsMedico?: BoolWithAggregatesFilter<"empleados"> | boolean
    Odontologo?: BoolNullableWithAggregatesFilter<"empleados"> | boolean | null
    Clave?: StringNullableWithAggregatesFilter<"empleados"> | string | null
    Estado_Empleado?: BoolNullableWithAggregatesFilter<"empleados"> | boolean | null
    POtraEsp?: BoolNullableWithAggregatesFilter<"empleados"> | boolean | null
    Registro_medico?: StringNullableWithAggregatesFilter<"empleados"> | string | null
    De?: StringNullableWithAggregatesFilter<"empleados"> | string | null
    Firma?: StringNullableWithAggregatesFilter<"empleados"> | string | null
    Registra?: BoolNullableWithAggregatesFilter<"empleados"> | boolean | null
    enfermeria?: BoolNullableWithAggregatesFilter<"empleados"> | boolean | null
    Perfil?: IntNullableWithAggregatesFilter<"empleados"> | number | null
    Perfil2?: IntNullableWithAggregatesFilter<"empleados"> | number | null
    phone?: StringNullableWithAggregatesFilter<"empleados"> | string | null
    Firmaimg?: BytesWithAggregatesFilter<"empleados"> | Uint8Array
    consultorio?: StringNullableWithAggregatesFilter<"empleados"> | string | null
    email?: StringNullableWithAggregatesFilter<"empleados"> | string | null
    IdCentro?: IntNullableWithAggregatesFilter<"empleados"> | number | null
    userpic?: BytesNullableWithAggregatesFilter<"empleados"> | Uint8Array | null
    TipoDocumento?: StringNullableWithAggregatesFilter<"empleados"> | string | null
    Documento?: StringNullableWithAggregatesFilter<"empleados"> | string | null
  }

  export type especialidad_empleadosWhereInput = {
    AND?: especialidad_empleadosWhereInput | especialidad_empleadosWhereInput[]
    OR?: especialidad_empleadosWhereInput[]
    NOT?: especialidad_empleadosWhereInput | especialidad_empleadosWhereInput[]
    Consecutivo?: IntFilter<"especialidad_empleados"> | number
    C_digo_empleado?: StringFilter<"especialidad_empleados"> | string
    C_digo_especialidad?: StringFilter<"especialidad_empleados"> | string
    IdCentro?: IntFilter<"especialidad_empleados"> | number
    Principal?: BoolNullableFilter<"especialidad_empleados"> | boolean | null
    Cups?: StringNullableFilter<"especialidad_empleados"> | string | null
    regimen_atencion?: StringNullableFilter<"especialidad_empleados"> | string | null
    MinutosXConsulta?: IntNullableFilter<"especialidad_empleados"> | number | null
    NoPacientes?: IntNullableFilter<"especialidad_empleados"> | number | null
    fecha_final?: DateTimeNullableFilter<"especialidad_empleados"> | Date | string | null
    fecha_inicial?: DateTimeNullableFilter<"especialidad_empleados"> | Date | string | null
    hf_m?: StringNullableFilter<"especialidad_empleados"> | string | null
    hf_t?: StringNullableFilter<"especialidad_empleados"> | string | null
    hi_m?: StringNullableFilter<"especialidad_empleados"> | string | null
    hi_t?: StringNullableFilter<"especialidad_empleados"> | string | null
    IdSede?: IntNullableFilter<"especialidad_empleados"> | number | null
    bot?: StringNullableFilter<"especialidad_empleados"> | string | null
    contrato?: StringNullableFilter<"especialidad_empleados"> | string | null
  }

  export type especialidad_empleadosOrderByWithRelationInput = {
    Consecutivo?: SortOrder
    C_digo_empleado?: SortOrder
    C_digo_especialidad?: SortOrder
    IdCentro?: SortOrder
    Principal?: SortOrderInput | SortOrder
    Cups?: SortOrderInput | SortOrder
    regimen_atencion?: SortOrderInput | SortOrder
    MinutosXConsulta?: SortOrderInput | SortOrder
    NoPacientes?: SortOrderInput | SortOrder
    fecha_final?: SortOrderInput | SortOrder
    fecha_inicial?: SortOrderInput | SortOrder
    hf_m?: SortOrderInput | SortOrder
    hf_t?: SortOrderInput | SortOrder
    hi_m?: SortOrderInput | SortOrder
    hi_t?: SortOrderInput | SortOrder
    IdSede?: SortOrderInput | SortOrder
    bot?: SortOrderInput | SortOrder
    contrato?: SortOrderInput | SortOrder
    _relevance?: especialidad_empleadosOrderByRelevanceInput
  }

  export type especialidad_empleadosWhereUniqueInput = Prisma.AtLeast<{
    Consecutivo?: number
    C_digo_empleado_C_digo_especialidad_IdCentro?: especialidad_empleadosC_digo_empleadoC_digo_especialidadIdCentroCompoundUniqueInput
    AND?: especialidad_empleadosWhereInput | especialidad_empleadosWhereInput[]
    OR?: especialidad_empleadosWhereInput[]
    NOT?: especialidad_empleadosWhereInput | especialidad_empleadosWhereInput[]
    C_digo_empleado?: StringFilter<"especialidad_empleados"> | string
    C_digo_especialidad?: StringFilter<"especialidad_empleados"> | string
    IdCentro?: IntFilter<"especialidad_empleados"> | number
    Principal?: BoolNullableFilter<"especialidad_empleados"> | boolean | null
    Cups?: StringNullableFilter<"especialidad_empleados"> | string | null
    regimen_atencion?: StringNullableFilter<"especialidad_empleados"> | string | null
    MinutosXConsulta?: IntNullableFilter<"especialidad_empleados"> | number | null
    NoPacientes?: IntNullableFilter<"especialidad_empleados"> | number | null
    fecha_final?: DateTimeNullableFilter<"especialidad_empleados"> | Date | string | null
    fecha_inicial?: DateTimeNullableFilter<"especialidad_empleados"> | Date | string | null
    hf_m?: StringNullableFilter<"especialidad_empleados"> | string | null
    hf_t?: StringNullableFilter<"especialidad_empleados"> | string | null
    hi_m?: StringNullableFilter<"especialidad_empleados"> | string | null
    hi_t?: StringNullableFilter<"especialidad_empleados"> | string | null
    IdSede?: IntNullableFilter<"especialidad_empleados"> | number | null
    bot?: StringNullableFilter<"especialidad_empleados"> | string | null
    contrato?: StringNullableFilter<"especialidad_empleados"> | string | null
  }, "C_digo_empleado_C_digo_especialidad_IdCentro" | "Consecutivo">

  export type especialidad_empleadosOrderByWithAggregationInput = {
    Consecutivo?: SortOrder
    C_digo_empleado?: SortOrder
    C_digo_especialidad?: SortOrder
    IdCentro?: SortOrder
    Principal?: SortOrderInput | SortOrder
    Cups?: SortOrderInput | SortOrder
    regimen_atencion?: SortOrderInput | SortOrder
    MinutosXConsulta?: SortOrderInput | SortOrder
    NoPacientes?: SortOrderInput | SortOrder
    fecha_final?: SortOrderInput | SortOrder
    fecha_inicial?: SortOrderInput | SortOrder
    hf_m?: SortOrderInput | SortOrder
    hf_t?: SortOrderInput | SortOrder
    hi_m?: SortOrderInput | SortOrder
    hi_t?: SortOrderInput | SortOrder
    IdSede?: SortOrderInput | SortOrder
    bot?: SortOrderInput | SortOrder
    contrato?: SortOrderInput | SortOrder
    _count?: especialidad_empleadosCountOrderByAggregateInput
    _avg?: especialidad_empleadosAvgOrderByAggregateInput
    _max?: especialidad_empleadosMaxOrderByAggregateInput
    _min?: especialidad_empleadosMinOrderByAggregateInput
    _sum?: especialidad_empleadosSumOrderByAggregateInput
  }

  export type especialidad_empleadosScalarWhereWithAggregatesInput = {
    AND?: especialidad_empleadosScalarWhereWithAggregatesInput | especialidad_empleadosScalarWhereWithAggregatesInput[]
    OR?: especialidad_empleadosScalarWhereWithAggregatesInput[]
    NOT?: especialidad_empleadosScalarWhereWithAggregatesInput | especialidad_empleadosScalarWhereWithAggregatesInput[]
    Consecutivo?: IntWithAggregatesFilter<"especialidad_empleados"> | number
    C_digo_empleado?: StringWithAggregatesFilter<"especialidad_empleados"> | string
    C_digo_especialidad?: StringWithAggregatesFilter<"especialidad_empleados"> | string
    IdCentro?: IntWithAggregatesFilter<"especialidad_empleados"> | number
    Principal?: BoolNullableWithAggregatesFilter<"especialidad_empleados"> | boolean | null
    Cups?: StringNullableWithAggregatesFilter<"especialidad_empleados"> | string | null
    regimen_atencion?: StringNullableWithAggregatesFilter<"especialidad_empleados"> | string | null
    MinutosXConsulta?: IntNullableWithAggregatesFilter<"especialidad_empleados"> | number | null
    NoPacientes?: IntNullableWithAggregatesFilter<"especialidad_empleados"> | number | null
    fecha_final?: DateTimeNullableWithAggregatesFilter<"especialidad_empleados"> | Date | string | null
    fecha_inicial?: DateTimeNullableWithAggregatesFilter<"especialidad_empleados"> | Date | string | null
    hf_m?: StringNullableWithAggregatesFilter<"especialidad_empleados"> | string | null
    hf_t?: StringNullableWithAggregatesFilter<"especialidad_empleados"> | string | null
    hi_m?: StringNullableWithAggregatesFilter<"especialidad_empleados"> | string | null
    hi_t?: StringNullableWithAggregatesFilter<"especialidad_empleados"> | string | null
    IdSede?: IntNullableWithAggregatesFilter<"especialidad_empleados"> | number | null
    bot?: StringNullableWithAggregatesFilter<"especialidad_empleados"> | string | null
    contrato?: StringNullableWithAggregatesFilter<"especialidad_empleados"> | string | null
  }

  export type especialidadcupsempleadoWhereInput = {
    AND?: especialidadcupsempleadoWhereInput | especialidadcupsempleadoWhereInput[]
    OR?: especialidadcupsempleadoWhereInput[]
    NOT?: especialidadcupsempleadoWhereInput | especialidadcupsempleadoWhereInput[]
    CodigoEmpleado?: StringFilter<"especialidadcupsempleado"> | string
    CodigoEspecialidad?: StringFilter<"especialidadcupsempleado"> | string
    Cups?: StringFilter<"especialidadcupsempleado"> | string
    Porcentaje?: FloatNullableFilter<"especialidadcupsempleado"> | number | null
    Valor?: FloatNullableFilter<"especialidadcupsempleado"> | number | null
  }

  export type especialidadcupsempleadoOrderByWithRelationInput = {
    CodigoEmpleado?: SortOrder
    CodigoEspecialidad?: SortOrder
    Cups?: SortOrder
    Porcentaje?: SortOrderInput | SortOrder
    Valor?: SortOrderInput | SortOrder
    _relevance?: especialidadcupsempleadoOrderByRelevanceInput
  }

  export type especialidadcupsempleadoWhereUniqueInput = Prisma.AtLeast<{
    CodigoEmpleado_CodigoEspecialidad_Cups?: especialidadcupsempleadoCodigoEmpleadoCodigoEspecialidadCupsCompoundUniqueInput
    AND?: especialidadcupsempleadoWhereInput | especialidadcupsempleadoWhereInput[]
    OR?: especialidadcupsempleadoWhereInput[]
    NOT?: especialidadcupsempleadoWhereInput | especialidadcupsempleadoWhereInput[]
    CodigoEmpleado?: StringFilter<"especialidadcupsempleado"> | string
    CodigoEspecialidad?: StringFilter<"especialidadcupsempleado"> | string
    Cups?: StringFilter<"especialidadcupsempleado"> | string
    Porcentaje?: FloatNullableFilter<"especialidadcupsempleado"> | number | null
    Valor?: FloatNullableFilter<"especialidadcupsempleado"> | number | null
  }, "CodigoEmpleado_CodigoEspecialidad_Cups">

  export type especialidadcupsempleadoOrderByWithAggregationInput = {
    CodigoEmpleado?: SortOrder
    CodigoEspecialidad?: SortOrder
    Cups?: SortOrder
    Porcentaje?: SortOrderInput | SortOrder
    Valor?: SortOrderInput | SortOrder
    _count?: especialidadcupsempleadoCountOrderByAggregateInput
    _avg?: especialidadcupsempleadoAvgOrderByAggregateInput
    _max?: especialidadcupsempleadoMaxOrderByAggregateInput
    _min?: especialidadcupsempleadoMinOrderByAggregateInput
    _sum?: especialidadcupsempleadoSumOrderByAggregateInput
  }

  export type especialidadcupsempleadoScalarWhereWithAggregatesInput = {
    AND?: especialidadcupsempleadoScalarWhereWithAggregatesInput | especialidadcupsempleadoScalarWhereWithAggregatesInput[]
    OR?: especialidadcupsempleadoScalarWhereWithAggregatesInput[]
    NOT?: especialidadcupsempleadoScalarWhereWithAggregatesInput | especialidadcupsempleadoScalarWhereWithAggregatesInput[]
    CodigoEmpleado?: StringWithAggregatesFilter<"especialidadcupsempleado"> | string
    CodigoEspecialidad?: StringWithAggregatesFilter<"especialidadcupsempleado"> | string
    Cups?: StringWithAggregatesFilter<"especialidadcupsempleado"> | string
    Porcentaje?: FloatNullableWithAggregatesFilter<"especialidadcupsempleado"> | number | null
    Valor?: FloatNullableWithAggregatesFilter<"especialidadcupsempleado"> | number | null
  }

  export type tventidadesWhereInput = {
    AND?: tventidadesWhereInput | tventidadesWhereInput[]
    OR?: tventidadesWhereInput[]
    NOT?: tventidadesWhereInput | tventidadesWhereInput[]
    Codigo?: StringFilter<"tventidades"> | string
    NombreEntidad?: StringNullableFilter<"tventidades"> | string | null
    Departamento?: StringNullableFilter<"tventidades"> | string | null
    Municipio?: StringNullableFilter<"tventidades"> | string | null
    Digitado?: BoolNullableFilter<"tventidades"> | boolean | null
    Nit?: StringFilter<"tventidades"> | string
    Dv?: StringFilter<"tventidades"> | string
    email?: StringFilter<"tventidades"> | string
    telefono?: StringFilter<"tventidades"> | string
    Direccion?: StringFilter<"tventidades"> | string
  }

  export type tventidadesOrderByWithRelationInput = {
    Codigo?: SortOrder
    NombreEntidad?: SortOrderInput | SortOrder
    Departamento?: SortOrderInput | SortOrder
    Municipio?: SortOrderInput | SortOrder
    Digitado?: SortOrderInput | SortOrder
    Nit?: SortOrder
    Dv?: SortOrder
    email?: SortOrder
    telefono?: SortOrder
    Direccion?: SortOrder
    _relevance?: tventidadesOrderByRelevanceInput
  }

  export type tventidadesWhereUniqueInput = Prisma.AtLeast<{
    Codigo?: string
    AND?: tventidadesWhereInput | tventidadesWhereInput[]
    OR?: tventidadesWhereInput[]
    NOT?: tventidadesWhereInput | tventidadesWhereInput[]
    NombreEntidad?: StringNullableFilter<"tventidades"> | string | null
    Departamento?: StringNullableFilter<"tventidades"> | string | null
    Municipio?: StringNullableFilter<"tventidades"> | string | null
    Digitado?: BoolNullableFilter<"tventidades"> | boolean | null
    Nit?: StringFilter<"tventidades"> | string
    Dv?: StringFilter<"tventidades"> | string
    email?: StringFilter<"tventidades"> | string
    telefono?: StringFilter<"tventidades"> | string
    Direccion?: StringFilter<"tventidades"> | string
  }, "Codigo">

  export type tventidadesOrderByWithAggregationInput = {
    Codigo?: SortOrder
    NombreEntidad?: SortOrderInput | SortOrder
    Departamento?: SortOrderInput | SortOrder
    Municipio?: SortOrderInput | SortOrder
    Digitado?: SortOrderInput | SortOrder
    Nit?: SortOrder
    Dv?: SortOrder
    email?: SortOrder
    telefono?: SortOrder
    Direccion?: SortOrder
    _count?: tventidadesCountOrderByAggregateInput
    _max?: tventidadesMaxOrderByAggregateInput
    _min?: tventidadesMinOrderByAggregateInput
  }

  export type tventidadesScalarWhereWithAggregatesInput = {
    AND?: tventidadesScalarWhereWithAggregatesInput | tventidadesScalarWhereWithAggregatesInput[]
    OR?: tventidadesScalarWhereWithAggregatesInput[]
    NOT?: tventidadesScalarWhereWithAggregatesInput | tventidadesScalarWhereWithAggregatesInput[]
    Codigo?: StringWithAggregatesFilter<"tventidades"> | string
    NombreEntidad?: StringNullableWithAggregatesFilter<"tventidades"> | string | null
    Departamento?: StringNullableWithAggregatesFilter<"tventidades"> | string | null
    Municipio?: StringNullableWithAggregatesFilter<"tventidades"> | string | null
    Digitado?: BoolNullableWithAggregatesFilter<"tventidades"> | boolean | null
    Nit?: StringWithAggregatesFilter<"tventidades"> | string
    Dv?: StringWithAggregatesFilter<"tventidades"> | string
    email?: StringWithAggregatesFilter<"tventidades"> | string
    telefono?: StringWithAggregatesFilter<"tventidades"> | string
    Direccion?: StringWithAggregatesFilter<"tventidades"> | string
  }

  export type tvespecialidadesWhereInput = {
    AND?: tvespecialidadesWhereInput | tvespecialidadesWhereInput[]
    OR?: tvespecialidadesWhereInput[]
    NOT?: tvespecialidadesWhereInput | tvespecialidadesWhereInput[]
    CodigoEspecialidad?: StringFilter<"tvespecialidades"> | string
    Especialidad?: StringNullableFilter<"tvespecialidades"> | string | null
    CUPS?: StringNullableFilter<"tvespecialidades"> | string | null
    CodigoServicio?: IntNullableFilter<"tvespecialidades"> | number | null
  }

  export type tvespecialidadesOrderByWithRelationInput = {
    CodigoEspecialidad?: SortOrder
    Especialidad?: SortOrderInput | SortOrder
    CUPS?: SortOrderInput | SortOrder
    CodigoServicio?: SortOrderInput | SortOrder
    _relevance?: tvespecialidadesOrderByRelevanceInput
  }

  export type tvespecialidadesWhereUniqueInput = Prisma.AtLeast<{
    CodigoEspecialidad?: string
    AND?: tvespecialidadesWhereInput | tvespecialidadesWhereInput[]
    OR?: tvespecialidadesWhereInput[]
    NOT?: tvespecialidadesWhereInput | tvespecialidadesWhereInput[]
    Especialidad?: StringNullableFilter<"tvespecialidades"> | string | null
    CUPS?: StringNullableFilter<"tvespecialidades"> | string | null
    CodigoServicio?: IntNullableFilter<"tvespecialidades"> | number | null
  }, "CodigoEspecialidad">

  export type tvespecialidadesOrderByWithAggregationInput = {
    CodigoEspecialidad?: SortOrder
    Especialidad?: SortOrderInput | SortOrder
    CUPS?: SortOrderInput | SortOrder
    CodigoServicio?: SortOrderInput | SortOrder
    _count?: tvespecialidadesCountOrderByAggregateInput
    _avg?: tvespecialidadesAvgOrderByAggregateInput
    _max?: tvespecialidadesMaxOrderByAggregateInput
    _min?: tvespecialidadesMinOrderByAggregateInput
    _sum?: tvespecialidadesSumOrderByAggregateInput
  }

  export type tvespecialidadesScalarWhereWithAggregatesInput = {
    AND?: tvespecialidadesScalarWhereWithAggregatesInput | tvespecialidadesScalarWhereWithAggregatesInput[]
    OR?: tvespecialidadesScalarWhereWithAggregatesInput[]
    NOT?: tvespecialidadesScalarWhereWithAggregatesInput | tvespecialidadesScalarWhereWithAggregatesInput[]
    CodigoEspecialidad?: StringWithAggregatesFilter<"tvespecialidades"> | string
    Especialidad?: StringNullableWithAggregatesFilter<"tvespecialidades"> | string | null
    CUPS?: StringNullableWithAggregatesFilter<"tvespecialidades"> | string | null
    CodigoServicio?: IntNullableWithAggregatesFilter<"tvespecialidades"> | number | null
  }

  export type tbldetalleremisionWhereInput = {
    AND?: tbldetalleremisionWhereInput | tbldetalleremisionWhereInput[]
    OR?: tbldetalleremisionWhereInput[]
    NOT?: tbldetalleremisionWhereInput | tbldetalleremisionWhereInput[]
    Id?: IntFilter<"tbldetalleremision"> | number
    IdOrden?: IntNullableFilter<"tbldetalleremision"> | number | null
    CodItem?: IntNullableFilter<"tbldetalleremision"> | number | null
    Descripcion?: StringNullableFilter<"tbldetalleremision"> | string | null
    CodServicio?: IntNullableFilter<"tbldetalleremision"> | number | null
    Ejecutada?: IntNullableFilter<"tbldetalleremision"> | number | null
    Fecha_Ejecutada?: DateTimeNullableFilter<"tbldetalleremision"> | Date | string | null
    Hora_Ejecutada?: DateTimeNullableFilter<"tbldetalleremision"> | Date | string | null
    Ejecutada_por?: StringNullableFilter<"tbldetalleremision"> | string | null
    Observaciones?: StringNullableFilter<"tbldetalleremision"> | string | null
    Mostrar?: IntNullableFilter<"tbldetalleremision"> | number | null
    IdMedicoOrdena?: StringNullableFilter<"tbldetalleremision"> | string | null
  }

  export type tbldetalleremisionOrderByWithRelationInput = {
    Id?: SortOrder
    IdOrden?: SortOrderInput | SortOrder
    CodItem?: SortOrderInput | SortOrder
    Descripcion?: SortOrderInput | SortOrder
    CodServicio?: SortOrderInput | SortOrder
    Ejecutada?: SortOrderInput | SortOrder
    Fecha_Ejecutada?: SortOrderInput | SortOrder
    Hora_Ejecutada?: SortOrderInput | SortOrder
    Ejecutada_por?: SortOrderInput | SortOrder
    Observaciones?: SortOrderInput | SortOrder
    Mostrar?: SortOrderInput | SortOrder
    IdMedicoOrdena?: SortOrderInput | SortOrder
    _relevance?: tbldetalleremisionOrderByRelevanceInput
  }

  export type tbldetalleremisionWhereUniqueInput = Prisma.AtLeast<{
    Id?: number
    AND?: tbldetalleremisionWhereInput | tbldetalleremisionWhereInput[]
    OR?: tbldetalleremisionWhereInput[]
    NOT?: tbldetalleremisionWhereInput | tbldetalleremisionWhereInput[]
    IdOrden?: IntNullableFilter<"tbldetalleremision"> | number | null
    CodItem?: IntNullableFilter<"tbldetalleremision"> | number | null
    Descripcion?: StringNullableFilter<"tbldetalleremision"> | string | null
    CodServicio?: IntNullableFilter<"tbldetalleremision"> | number | null
    Ejecutada?: IntNullableFilter<"tbldetalleremision"> | number | null
    Fecha_Ejecutada?: DateTimeNullableFilter<"tbldetalleremision"> | Date | string | null
    Hora_Ejecutada?: DateTimeNullableFilter<"tbldetalleremision"> | Date | string | null
    Ejecutada_por?: StringNullableFilter<"tbldetalleremision"> | string | null
    Observaciones?: StringNullableFilter<"tbldetalleremision"> | string | null
    Mostrar?: IntNullableFilter<"tbldetalleremision"> | number | null
    IdMedicoOrdena?: StringNullableFilter<"tbldetalleremision"> | string | null
  }, "Id">

  export type tbldetalleremisionOrderByWithAggregationInput = {
    Id?: SortOrder
    IdOrden?: SortOrderInput | SortOrder
    CodItem?: SortOrderInput | SortOrder
    Descripcion?: SortOrderInput | SortOrder
    CodServicio?: SortOrderInput | SortOrder
    Ejecutada?: SortOrderInput | SortOrder
    Fecha_Ejecutada?: SortOrderInput | SortOrder
    Hora_Ejecutada?: SortOrderInput | SortOrder
    Ejecutada_por?: SortOrderInput | SortOrder
    Observaciones?: SortOrderInput | SortOrder
    Mostrar?: SortOrderInput | SortOrder
    IdMedicoOrdena?: SortOrderInput | SortOrder
    _count?: tbldetalleremisionCountOrderByAggregateInput
    _avg?: tbldetalleremisionAvgOrderByAggregateInput
    _max?: tbldetalleremisionMaxOrderByAggregateInput
    _min?: tbldetalleremisionMinOrderByAggregateInput
    _sum?: tbldetalleremisionSumOrderByAggregateInput
  }

  export type tbldetalleremisionScalarWhereWithAggregatesInput = {
    AND?: tbldetalleremisionScalarWhereWithAggregatesInput | tbldetalleremisionScalarWhereWithAggregatesInput[]
    OR?: tbldetalleremisionScalarWhereWithAggregatesInput[]
    NOT?: tbldetalleremisionScalarWhereWithAggregatesInput | tbldetalleremisionScalarWhereWithAggregatesInput[]
    Id?: IntWithAggregatesFilter<"tbldetalleremision"> | number
    IdOrden?: IntNullableWithAggregatesFilter<"tbldetalleremision"> | number | null
    CodItem?: IntNullableWithAggregatesFilter<"tbldetalleremision"> | number | null
    Descripcion?: StringNullableWithAggregatesFilter<"tbldetalleremision"> | string | null
    CodServicio?: IntNullableWithAggregatesFilter<"tbldetalleremision"> | number | null
    Ejecutada?: IntNullableWithAggregatesFilter<"tbldetalleremision"> | number | null
    Fecha_Ejecutada?: DateTimeNullableWithAggregatesFilter<"tbldetalleremision"> | Date | string | null
    Hora_Ejecutada?: DateTimeNullableWithAggregatesFilter<"tbldetalleremision"> | Date | string | null
    Ejecutada_por?: StringNullableWithAggregatesFilter<"tbldetalleremision"> | string | null
    Observaciones?: StringNullableWithAggregatesFilter<"tbldetalleremision"> | string | null
    Mostrar?: IntNullableWithAggregatesFilter<"tbldetalleremision"> | number | null
    IdMedicoOrdena?: StringNullableWithAggregatesFilter<"tbldetalleremision"> | string | null
  }

  export type agendaCreateInput = {
    IdModalidad?: number
    fecha_solicitud?: Date | string | null
    fecha_cita: Date | string
    idhora: string
    idmedico: string
    idusuario?: string | null
    Telefono?: string | null
    Cumplida?: number | null
    NoAdmision?: number | null
    TipoCita?: string | null
    AsignadaPor?: string | null
    CanceldaPor?: string | null
    Fecha_cancelacion?: Date | string | null
    TipoContrato?: string | null
    Entidad?: string | null
    MedioSolicitud?: string | null
    Finalidad?: string | null
    Estado?: string | null
    TipoAgenda?: string | null
    Activada_por?: string | null
    Fecha_Activacion?: Date | string | null
    Gestionada?: number | null
    Hora_Activacion?: Date | string | null
    LlegoTarde?: string | null
    notificacionrecordatorio?: string | null
    notificacioncancelacion?: string | null
    notificacion_encuesta?: string | null
    Programa?: string | null
    clase_cita?: string | null
    IdCentro?: number | null
    IdSede?: number | null
    Bloqueada_Por?: string | null
    fecha_bloqueo?: Date | string | null
    cancelada_por?: string | null
    paciente_cancelada?: string | null
    fecha_cancelada?: Date | string | null
  }

  export type agendaUncheckedCreateInput = {
    idagenda?: number
    IdModalidad?: number
    fecha_solicitud?: Date | string | null
    fecha_cita: Date | string
    idhora: string
    idmedico: string
    idusuario?: string | null
    Telefono?: string | null
    Cumplida?: number | null
    NoAdmision?: number | null
    TipoCita?: string | null
    AsignadaPor?: string | null
    CanceldaPor?: string | null
    Fecha_cancelacion?: Date | string | null
    TipoContrato?: string | null
    Entidad?: string | null
    MedioSolicitud?: string | null
    Finalidad?: string | null
    Estado?: string | null
    TipoAgenda?: string | null
    Activada_por?: string | null
    Fecha_Activacion?: Date | string | null
    Gestionada?: number | null
    Hora_Activacion?: Date | string | null
    LlegoTarde?: string | null
    notificacionrecordatorio?: string | null
    notificacioncancelacion?: string | null
    notificacion_encuesta?: string | null
    Programa?: string | null
    clase_cita?: string | null
    IdCentro?: number | null
    IdSede?: number | null
    Bloqueada_Por?: string | null
    fecha_bloqueo?: Date | string | null
    cancelada_por?: string | null
    paciente_cancelada?: string | null
    fecha_cancelada?: Date | string | null
  }

  export type agendaUpdateInput = {
    IdModalidad?: IntFieldUpdateOperationsInput | number
    fecha_solicitud?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_cita?: DateTimeFieldUpdateOperationsInput | Date | string
    idhora?: StringFieldUpdateOperationsInput | string
    idmedico?: StringFieldUpdateOperationsInput | string
    idusuario?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono?: NullableStringFieldUpdateOperationsInput | string | null
    Cumplida?: NullableIntFieldUpdateOperationsInput | number | null
    NoAdmision?: NullableIntFieldUpdateOperationsInput | number | null
    TipoCita?: NullableStringFieldUpdateOperationsInput | string | null
    AsignadaPor?: NullableStringFieldUpdateOperationsInput | string | null
    CanceldaPor?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_cancelacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    TipoContrato?: NullableStringFieldUpdateOperationsInput | string | null
    Entidad?: NullableStringFieldUpdateOperationsInput | string | null
    MedioSolicitud?: NullableStringFieldUpdateOperationsInput | string | null
    Finalidad?: NullableStringFieldUpdateOperationsInput | string | null
    Estado?: NullableStringFieldUpdateOperationsInput | string | null
    TipoAgenda?: NullableStringFieldUpdateOperationsInput | string | null
    Activada_por?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Activacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Gestionada?: NullableIntFieldUpdateOperationsInput | number | null
    Hora_Activacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    LlegoTarde?: NullableStringFieldUpdateOperationsInput | string | null
    notificacionrecordatorio?: NullableStringFieldUpdateOperationsInput | string | null
    notificacioncancelacion?: NullableStringFieldUpdateOperationsInput | string | null
    notificacion_encuesta?: NullableStringFieldUpdateOperationsInput | string | null
    Programa?: NullableStringFieldUpdateOperationsInput | string | null
    clase_cita?: NullableStringFieldUpdateOperationsInput | string | null
    IdCentro?: NullableIntFieldUpdateOperationsInput | number | null
    IdSede?: NullableIntFieldUpdateOperationsInput | number | null
    Bloqueada_Por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_bloqueo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelada_por?: NullableStringFieldUpdateOperationsInput | string | null
    paciente_cancelada?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_cancelada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type agendaUncheckedUpdateInput = {
    idagenda?: IntFieldUpdateOperationsInput | number
    IdModalidad?: IntFieldUpdateOperationsInput | number
    fecha_solicitud?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_cita?: DateTimeFieldUpdateOperationsInput | Date | string
    idhora?: StringFieldUpdateOperationsInput | string
    idmedico?: StringFieldUpdateOperationsInput | string
    idusuario?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono?: NullableStringFieldUpdateOperationsInput | string | null
    Cumplida?: NullableIntFieldUpdateOperationsInput | number | null
    NoAdmision?: NullableIntFieldUpdateOperationsInput | number | null
    TipoCita?: NullableStringFieldUpdateOperationsInput | string | null
    AsignadaPor?: NullableStringFieldUpdateOperationsInput | string | null
    CanceldaPor?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_cancelacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    TipoContrato?: NullableStringFieldUpdateOperationsInput | string | null
    Entidad?: NullableStringFieldUpdateOperationsInput | string | null
    MedioSolicitud?: NullableStringFieldUpdateOperationsInput | string | null
    Finalidad?: NullableStringFieldUpdateOperationsInput | string | null
    Estado?: NullableStringFieldUpdateOperationsInput | string | null
    TipoAgenda?: NullableStringFieldUpdateOperationsInput | string | null
    Activada_por?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Activacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Gestionada?: NullableIntFieldUpdateOperationsInput | number | null
    Hora_Activacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    LlegoTarde?: NullableStringFieldUpdateOperationsInput | string | null
    notificacionrecordatorio?: NullableStringFieldUpdateOperationsInput | string | null
    notificacioncancelacion?: NullableStringFieldUpdateOperationsInput | string | null
    notificacion_encuesta?: NullableStringFieldUpdateOperationsInput | string | null
    Programa?: NullableStringFieldUpdateOperationsInput | string | null
    clase_cita?: NullableStringFieldUpdateOperationsInput | string | null
    IdCentro?: NullableIntFieldUpdateOperationsInput | number | null
    IdSede?: NullableIntFieldUpdateOperationsInput | number | null
    Bloqueada_Por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_bloqueo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelada_por?: NullableStringFieldUpdateOperationsInput | string | null
    paciente_cancelada?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_cancelada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type agendaCreateManyInput = {
    idagenda?: number
    IdModalidad?: number
    fecha_solicitud?: Date | string | null
    fecha_cita: Date | string
    idhora: string
    idmedico: string
    idusuario?: string | null
    Telefono?: string | null
    Cumplida?: number | null
    NoAdmision?: number | null
    TipoCita?: string | null
    AsignadaPor?: string | null
    CanceldaPor?: string | null
    Fecha_cancelacion?: Date | string | null
    TipoContrato?: string | null
    Entidad?: string | null
    MedioSolicitud?: string | null
    Finalidad?: string | null
    Estado?: string | null
    TipoAgenda?: string | null
    Activada_por?: string | null
    Fecha_Activacion?: Date | string | null
    Gestionada?: number | null
    Hora_Activacion?: Date | string | null
    LlegoTarde?: string | null
    notificacionrecordatorio?: string | null
    notificacioncancelacion?: string | null
    notificacion_encuesta?: string | null
    Programa?: string | null
    clase_cita?: string | null
    IdCentro?: number | null
    IdSede?: number | null
    Bloqueada_Por?: string | null
    fecha_bloqueo?: Date | string | null
    cancelada_por?: string | null
    paciente_cancelada?: string | null
    fecha_cancelada?: Date | string | null
  }

  export type agendaUpdateManyMutationInput = {
    IdModalidad?: IntFieldUpdateOperationsInput | number
    fecha_solicitud?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_cita?: DateTimeFieldUpdateOperationsInput | Date | string
    idhora?: StringFieldUpdateOperationsInput | string
    idmedico?: StringFieldUpdateOperationsInput | string
    idusuario?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono?: NullableStringFieldUpdateOperationsInput | string | null
    Cumplida?: NullableIntFieldUpdateOperationsInput | number | null
    NoAdmision?: NullableIntFieldUpdateOperationsInput | number | null
    TipoCita?: NullableStringFieldUpdateOperationsInput | string | null
    AsignadaPor?: NullableStringFieldUpdateOperationsInput | string | null
    CanceldaPor?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_cancelacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    TipoContrato?: NullableStringFieldUpdateOperationsInput | string | null
    Entidad?: NullableStringFieldUpdateOperationsInput | string | null
    MedioSolicitud?: NullableStringFieldUpdateOperationsInput | string | null
    Finalidad?: NullableStringFieldUpdateOperationsInput | string | null
    Estado?: NullableStringFieldUpdateOperationsInput | string | null
    TipoAgenda?: NullableStringFieldUpdateOperationsInput | string | null
    Activada_por?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Activacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Gestionada?: NullableIntFieldUpdateOperationsInput | number | null
    Hora_Activacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    LlegoTarde?: NullableStringFieldUpdateOperationsInput | string | null
    notificacionrecordatorio?: NullableStringFieldUpdateOperationsInput | string | null
    notificacioncancelacion?: NullableStringFieldUpdateOperationsInput | string | null
    notificacion_encuesta?: NullableStringFieldUpdateOperationsInput | string | null
    Programa?: NullableStringFieldUpdateOperationsInput | string | null
    clase_cita?: NullableStringFieldUpdateOperationsInput | string | null
    IdCentro?: NullableIntFieldUpdateOperationsInput | number | null
    IdSede?: NullableIntFieldUpdateOperationsInput | number | null
    Bloqueada_Por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_bloqueo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelada_por?: NullableStringFieldUpdateOperationsInput | string | null
    paciente_cancelada?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_cancelada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type agendaUncheckedUpdateManyInput = {
    idagenda?: IntFieldUpdateOperationsInput | number
    IdModalidad?: IntFieldUpdateOperationsInput | number
    fecha_solicitud?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_cita?: DateTimeFieldUpdateOperationsInput | Date | string
    idhora?: StringFieldUpdateOperationsInput | string
    idmedico?: StringFieldUpdateOperationsInput | string
    idusuario?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono?: NullableStringFieldUpdateOperationsInput | string | null
    Cumplida?: NullableIntFieldUpdateOperationsInput | number | null
    NoAdmision?: NullableIntFieldUpdateOperationsInput | number | null
    TipoCita?: NullableStringFieldUpdateOperationsInput | string | null
    AsignadaPor?: NullableStringFieldUpdateOperationsInput | string | null
    CanceldaPor?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_cancelacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    TipoContrato?: NullableStringFieldUpdateOperationsInput | string | null
    Entidad?: NullableStringFieldUpdateOperationsInput | string | null
    MedioSolicitud?: NullableStringFieldUpdateOperationsInput | string | null
    Finalidad?: NullableStringFieldUpdateOperationsInput | string | null
    Estado?: NullableStringFieldUpdateOperationsInput | string | null
    TipoAgenda?: NullableStringFieldUpdateOperationsInput | string | null
    Activada_por?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Activacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Gestionada?: NullableIntFieldUpdateOperationsInput | number | null
    Hora_Activacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    LlegoTarde?: NullableStringFieldUpdateOperationsInput | string | null
    notificacionrecordatorio?: NullableStringFieldUpdateOperationsInput | string | null
    notificacioncancelacion?: NullableStringFieldUpdateOperationsInput | string | null
    notificacion_encuesta?: NullableStringFieldUpdateOperationsInput | string | null
    Programa?: NullableStringFieldUpdateOperationsInput | string | null
    clase_cita?: NullableStringFieldUpdateOperationsInput | string | null
    IdCentro?: NullableIntFieldUpdateOperationsInput | number | null
    IdSede?: NullableIntFieldUpdateOperationsInput | number | null
    Bloqueada_Por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_bloqueo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelada_por?: NullableStringFieldUpdateOperationsInput | string | null
    paciente_cancelada?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_cancelada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type usuariosCreateInput = {
    Carnet?: string
    codPrestador?: string | null
    Identificaci_n_usuario: string
    Tipo_identificaci_n: string
    Primer_apellido: string
    Segundo_apellido?: string | null
    Primer_nombre: string
    Segundo_nombre?: string | null
    Direcci_n?: string | null
    Tel_fono?: string | null
    Tipo_usuario: string
    Tipo_afiliado?: string | null
    C_digo_Ocupaci_n?: string | null
    Unidad_edad?: string
    Edad?: string
    Sexo: string
    Residencia?: string
    Zona_residencia?: string
    cedula_afiliado?: string | null
    Fecha_nacimient?: Date | string | null
    NHistoria?: string | null
    Estado_civil?: string | null
    Estado?: string | null
    fecha_retiro?: Date | string | null
    Ciudad?: string | null
    Sector?: string
    Nombre_acudiente?: string | null
    Telefono_acudiente?: string | null
    Antecedente_Patologico1?: string | null
    Antecedente_Patologico2?: string | null
    Antecedente_Patologico3?: string | null
    Antecedente_Quirurgico1?: string | null
    Antecedente_Quirurgico2?: string | null
    Antecedente_Familiar1?: string | null
    Antecedente_Familiar2?: string | null
    Antecedente_Familiar3?: string | null
    Hemoclasificaci_n?: string | null
    RH?: string | null
    Fecha_afiliacion?: Date | string | null
    Parentezco?: string | null
    Ciudad_cedula?: string | null
    Escalafon_afiliado?: string | null
    Discapacidad?: string | null
    Estrato?: string | null
    AL1?: number | null
    AL2?: number | null
    Cod_medico?: string | null
    Codigo_eps?: string
    Rango?: string | null
    Pagos?: string | null
    Cod_odontologo?: string | null
    Fecha_novedad?: Date | string | null
    Contrato?: string | null
    N_mero_afiliaci_n?: string | null
    Etnico?: string | null
    NumeroSemanasCotizadas?: number | null
    LugarNacimiento?: string | null
    NroHijos?: number | null
    Escolaridad?: string | null
    FechaAfiliacion?: Date | string | null
    Celular?: string | null
    CorreoElectr_nico?: string | null
    Responsable?: string | null
    Telefono_Responsable?: string | null
    Religion?: string | null
    Telefono_Secundario?: string | null
    email?: string | null
    Fecha_Creado?: string | null
    Creado_Por?: string | null
    Fecha_Modificado?: string | null
    Modificado_por?: string | null
    Fecha_Estado?: string | null
    Portabilidad?: string | null
    Fecha_Portabilidad?: string | null
    nombre_disp_asignado?: string | null
    Genero?: string | null
    Poblacion_Clave?: string | null
    Gestacion?: string | null
    Victima_del_Conflicto_armado?: string | null
    VICTIMA_DEL_MALTRATO?: string | null
    ABANDONO_SOCIAL?: string | null
    DESESCOLARIZADO?: string | null
    DESEMPLEADO?: string | null
    CARCELARIO?: string | null
    MIGRANTE?: string | null
    TRABAJADORA_SEXUAL?: string | null
    POBLACION_LGTBI?: string | null
    ORIENTACION_SEXUAL?: string | null
    Barrio?: string | null
    confirmacion_telefono?: string | null
    poll?: string | null
    Clave?: string | null
    codPaisResidencia?: string | null
    codMunicipioResidencia?: string | null
    codDepartamentoResidencia?: string | null
    codPaisOrigen?: string | null
    codZonaTerritorialResidencia?: string | null
    incapacidad?: string | null
    Capitado?: $Enums.usuarios_Capitado | null
    IdCentro?: number | null
    vacunas_completas?: string | null
    intervenciones_quirurgicas?: string | null
    alergia?: string | null
  }

  export type usuariosUncheckedCreateInput = {
    Carnet?: string
    codPrestador?: string | null
    Identificaci_n_usuario: string
    Tipo_identificaci_n: string
    Primer_apellido: string
    Segundo_apellido?: string | null
    Primer_nombre: string
    Segundo_nombre?: string | null
    Direcci_n?: string | null
    Tel_fono?: string | null
    Tipo_usuario: string
    Tipo_afiliado?: string | null
    C_digo_Ocupaci_n?: string | null
    Unidad_edad?: string
    Edad?: string
    Sexo: string
    Residencia?: string
    Zona_residencia?: string
    cedula_afiliado?: string | null
    Fecha_nacimient?: Date | string | null
    NHistoria?: string | null
    Estado_civil?: string | null
    Estado?: string | null
    fecha_retiro?: Date | string | null
    Ciudad?: string | null
    Sector?: string
    Nombre_acudiente?: string | null
    Telefono_acudiente?: string | null
    Antecedente_Patologico1?: string | null
    Antecedente_Patologico2?: string | null
    Antecedente_Patologico3?: string | null
    Antecedente_Quirurgico1?: string | null
    Antecedente_Quirurgico2?: string | null
    Antecedente_Familiar1?: string | null
    Antecedente_Familiar2?: string | null
    Antecedente_Familiar3?: string | null
    Hemoclasificaci_n?: string | null
    RH?: string | null
    Fecha_afiliacion?: Date | string | null
    Parentezco?: string | null
    Ciudad_cedula?: string | null
    Escalafon_afiliado?: string | null
    Discapacidad?: string | null
    Estrato?: string | null
    AL1?: number | null
    AL2?: number | null
    Cod_medico?: string | null
    Codigo_eps?: string
    Rango?: string | null
    Pagos?: string | null
    Cod_odontologo?: string | null
    Fecha_novedad?: Date | string | null
    Contrato?: string | null
    N_mero_afiliaci_n?: string | null
    Etnico?: string | null
    NumeroSemanasCotizadas?: number | null
    LugarNacimiento?: string | null
    NroHijos?: number | null
    Escolaridad?: string | null
    FechaAfiliacion?: Date | string | null
    Celular?: string | null
    CorreoElectr_nico?: string | null
    Responsable?: string | null
    Telefono_Responsable?: string | null
    Religion?: string | null
    Telefono_Secundario?: string | null
    email?: string | null
    Fecha_Creado?: string | null
    Creado_Por?: string | null
    Fecha_Modificado?: string | null
    Modificado_por?: string | null
    Fecha_Estado?: string | null
    Portabilidad?: string | null
    Fecha_Portabilidad?: string | null
    nombre_disp_asignado?: string | null
    Genero?: string | null
    Poblacion_Clave?: string | null
    Gestacion?: string | null
    Victima_del_Conflicto_armado?: string | null
    VICTIMA_DEL_MALTRATO?: string | null
    ABANDONO_SOCIAL?: string | null
    DESESCOLARIZADO?: string | null
    DESEMPLEADO?: string | null
    CARCELARIO?: string | null
    MIGRANTE?: string | null
    TRABAJADORA_SEXUAL?: string | null
    POBLACION_LGTBI?: string | null
    ORIENTACION_SEXUAL?: string | null
    Barrio?: string | null
    confirmacion_telefono?: string | null
    poll?: string | null
    Clave?: string | null
    codPaisResidencia?: string | null
    codMunicipioResidencia?: string | null
    codDepartamentoResidencia?: string | null
    codPaisOrigen?: string | null
    codZonaTerritorialResidencia?: string | null
    incapacidad?: string | null
    Capitado?: $Enums.usuarios_Capitado | null
    IdUsuario?: number
    IdCentro?: number | null
    vacunas_completas?: string | null
    intervenciones_quirurgicas?: string | null
    alergia?: string | null
  }

  export type usuariosUpdateInput = {
    Carnet?: StringFieldUpdateOperationsInput | string
    codPrestador?: NullableStringFieldUpdateOperationsInput | string | null
    Identificaci_n_usuario?: StringFieldUpdateOperationsInput | string
    Tipo_identificaci_n?: StringFieldUpdateOperationsInput | string
    Primer_apellido?: StringFieldUpdateOperationsInput | string
    Segundo_apellido?: NullableStringFieldUpdateOperationsInput | string | null
    Primer_nombre?: StringFieldUpdateOperationsInput | string
    Segundo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    Direcci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Tel_fono?: NullableStringFieldUpdateOperationsInput | string | null
    Tipo_usuario?: StringFieldUpdateOperationsInput | string
    Tipo_afiliado?: NullableStringFieldUpdateOperationsInput | string | null
    C_digo_Ocupaci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Unidad_edad?: StringFieldUpdateOperationsInput | string
    Edad?: StringFieldUpdateOperationsInput | string
    Sexo?: StringFieldUpdateOperationsInput | string
    Residencia?: StringFieldUpdateOperationsInput | string
    Zona_residencia?: StringFieldUpdateOperationsInput | string
    cedula_afiliado?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_nacimient?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    NHistoria?: NullableStringFieldUpdateOperationsInput | string | null
    Estado_civil?: NullableStringFieldUpdateOperationsInput | string | null
    Estado?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_retiro?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Ciudad?: NullableStringFieldUpdateOperationsInput | string | null
    Sector?: StringFieldUpdateOperationsInput | string
    Nombre_acudiente?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono_acudiente?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Patologico1?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Patologico2?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Patologico3?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Quirurgico1?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Quirurgico2?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Familiar1?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Familiar2?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Familiar3?: NullableStringFieldUpdateOperationsInput | string | null
    Hemoclasificaci_n?: NullableStringFieldUpdateOperationsInput | string | null
    RH?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_afiliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Parentezco?: NullableStringFieldUpdateOperationsInput | string | null
    Ciudad_cedula?: NullableStringFieldUpdateOperationsInput | string | null
    Escalafon_afiliado?: NullableStringFieldUpdateOperationsInput | string | null
    Discapacidad?: NullableStringFieldUpdateOperationsInput | string | null
    Estrato?: NullableStringFieldUpdateOperationsInput | string | null
    AL1?: NullableIntFieldUpdateOperationsInput | number | null
    AL2?: NullableIntFieldUpdateOperationsInput | number | null
    Cod_medico?: NullableStringFieldUpdateOperationsInput | string | null
    Codigo_eps?: StringFieldUpdateOperationsInput | string
    Rango?: NullableStringFieldUpdateOperationsInput | string | null
    Pagos?: NullableStringFieldUpdateOperationsInput | string | null
    Cod_odontologo?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_novedad?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Contrato?: NullableStringFieldUpdateOperationsInput | string | null
    N_mero_afiliaci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Etnico?: NullableStringFieldUpdateOperationsInput | string | null
    NumeroSemanasCotizadas?: NullableIntFieldUpdateOperationsInput | number | null
    LugarNacimiento?: NullableStringFieldUpdateOperationsInput | string | null
    NroHijos?: NullableIntFieldUpdateOperationsInput | number | null
    Escolaridad?: NullableStringFieldUpdateOperationsInput | string | null
    FechaAfiliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Celular?: NullableStringFieldUpdateOperationsInput | string | null
    CorreoElectr_nico?: NullableStringFieldUpdateOperationsInput | string | null
    Responsable?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono_Responsable?: NullableStringFieldUpdateOperationsInput | string | null
    Religion?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono_Secundario?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Creado?: NullableStringFieldUpdateOperationsInput | string | null
    Creado_Por?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Modificado?: NullableStringFieldUpdateOperationsInput | string | null
    Modificado_por?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Estado?: NullableStringFieldUpdateOperationsInput | string | null
    Portabilidad?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Portabilidad?: NullableStringFieldUpdateOperationsInput | string | null
    nombre_disp_asignado?: NullableStringFieldUpdateOperationsInput | string | null
    Genero?: NullableStringFieldUpdateOperationsInput | string | null
    Poblacion_Clave?: NullableStringFieldUpdateOperationsInput | string | null
    Gestacion?: NullableStringFieldUpdateOperationsInput | string | null
    Victima_del_Conflicto_armado?: NullableStringFieldUpdateOperationsInput | string | null
    VICTIMA_DEL_MALTRATO?: NullableStringFieldUpdateOperationsInput | string | null
    ABANDONO_SOCIAL?: NullableStringFieldUpdateOperationsInput | string | null
    DESESCOLARIZADO?: NullableStringFieldUpdateOperationsInput | string | null
    DESEMPLEADO?: NullableStringFieldUpdateOperationsInput | string | null
    CARCELARIO?: NullableStringFieldUpdateOperationsInput | string | null
    MIGRANTE?: NullableStringFieldUpdateOperationsInput | string | null
    TRABAJADORA_SEXUAL?: NullableStringFieldUpdateOperationsInput | string | null
    POBLACION_LGTBI?: NullableStringFieldUpdateOperationsInput | string | null
    ORIENTACION_SEXUAL?: NullableStringFieldUpdateOperationsInput | string | null
    Barrio?: NullableStringFieldUpdateOperationsInput | string | null
    confirmacion_telefono?: NullableStringFieldUpdateOperationsInput | string | null
    poll?: NullableStringFieldUpdateOperationsInput | string | null
    Clave?: NullableStringFieldUpdateOperationsInput | string | null
    codPaisResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    codMunicipioResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    codDepartamentoResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    codPaisOrigen?: NullableStringFieldUpdateOperationsInput | string | null
    codZonaTerritorialResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    incapacidad?: NullableStringFieldUpdateOperationsInput | string | null
    Capitado?: NullableEnumusuarios_CapitadoFieldUpdateOperationsInput | $Enums.usuarios_Capitado | null
    IdCentro?: NullableIntFieldUpdateOperationsInput | number | null
    vacunas_completas?: NullableStringFieldUpdateOperationsInput | string | null
    intervenciones_quirurgicas?: NullableStringFieldUpdateOperationsInput | string | null
    alergia?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type usuariosUncheckedUpdateInput = {
    Carnet?: StringFieldUpdateOperationsInput | string
    codPrestador?: NullableStringFieldUpdateOperationsInput | string | null
    Identificaci_n_usuario?: StringFieldUpdateOperationsInput | string
    Tipo_identificaci_n?: StringFieldUpdateOperationsInput | string
    Primer_apellido?: StringFieldUpdateOperationsInput | string
    Segundo_apellido?: NullableStringFieldUpdateOperationsInput | string | null
    Primer_nombre?: StringFieldUpdateOperationsInput | string
    Segundo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    Direcci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Tel_fono?: NullableStringFieldUpdateOperationsInput | string | null
    Tipo_usuario?: StringFieldUpdateOperationsInput | string
    Tipo_afiliado?: NullableStringFieldUpdateOperationsInput | string | null
    C_digo_Ocupaci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Unidad_edad?: StringFieldUpdateOperationsInput | string
    Edad?: StringFieldUpdateOperationsInput | string
    Sexo?: StringFieldUpdateOperationsInput | string
    Residencia?: StringFieldUpdateOperationsInput | string
    Zona_residencia?: StringFieldUpdateOperationsInput | string
    cedula_afiliado?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_nacimient?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    NHistoria?: NullableStringFieldUpdateOperationsInput | string | null
    Estado_civil?: NullableStringFieldUpdateOperationsInput | string | null
    Estado?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_retiro?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Ciudad?: NullableStringFieldUpdateOperationsInput | string | null
    Sector?: StringFieldUpdateOperationsInput | string
    Nombre_acudiente?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono_acudiente?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Patologico1?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Patologico2?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Patologico3?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Quirurgico1?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Quirurgico2?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Familiar1?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Familiar2?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Familiar3?: NullableStringFieldUpdateOperationsInput | string | null
    Hemoclasificaci_n?: NullableStringFieldUpdateOperationsInput | string | null
    RH?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_afiliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Parentezco?: NullableStringFieldUpdateOperationsInput | string | null
    Ciudad_cedula?: NullableStringFieldUpdateOperationsInput | string | null
    Escalafon_afiliado?: NullableStringFieldUpdateOperationsInput | string | null
    Discapacidad?: NullableStringFieldUpdateOperationsInput | string | null
    Estrato?: NullableStringFieldUpdateOperationsInput | string | null
    AL1?: NullableIntFieldUpdateOperationsInput | number | null
    AL2?: NullableIntFieldUpdateOperationsInput | number | null
    Cod_medico?: NullableStringFieldUpdateOperationsInput | string | null
    Codigo_eps?: StringFieldUpdateOperationsInput | string
    Rango?: NullableStringFieldUpdateOperationsInput | string | null
    Pagos?: NullableStringFieldUpdateOperationsInput | string | null
    Cod_odontologo?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_novedad?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Contrato?: NullableStringFieldUpdateOperationsInput | string | null
    N_mero_afiliaci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Etnico?: NullableStringFieldUpdateOperationsInput | string | null
    NumeroSemanasCotizadas?: NullableIntFieldUpdateOperationsInput | number | null
    LugarNacimiento?: NullableStringFieldUpdateOperationsInput | string | null
    NroHijos?: NullableIntFieldUpdateOperationsInput | number | null
    Escolaridad?: NullableStringFieldUpdateOperationsInput | string | null
    FechaAfiliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Celular?: NullableStringFieldUpdateOperationsInput | string | null
    CorreoElectr_nico?: NullableStringFieldUpdateOperationsInput | string | null
    Responsable?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono_Responsable?: NullableStringFieldUpdateOperationsInput | string | null
    Religion?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono_Secundario?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Creado?: NullableStringFieldUpdateOperationsInput | string | null
    Creado_Por?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Modificado?: NullableStringFieldUpdateOperationsInput | string | null
    Modificado_por?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Estado?: NullableStringFieldUpdateOperationsInput | string | null
    Portabilidad?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Portabilidad?: NullableStringFieldUpdateOperationsInput | string | null
    nombre_disp_asignado?: NullableStringFieldUpdateOperationsInput | string | null
    Genero?: NullableStringFieldUpdateOperationsInput | string | null
    Poblacion_Clave?: NullableStringFieldUpdateOperationsInput | string | null
    Gestacion?: NullableStringFieldUpdateOperationsInput | string | null
    Victima_del_Conflicto_armado?: NullableStringFieldUpdateOperationsInput | string | null
    VICTIMA_DEL_MALTRATO?: NullableStringFieldUpdateOperationsInput | string | null
    ABANDONO_SOCIAL?: NullableStringFieldUpdateOperationsInput | string | null
    DESESCOLARIZADO?: NullableStringFieldUpdateOperationsInput | string | null
    DESEMPLEADO?: NullableStringFieldUpdateOperationsInput | string | null
    CARCELARIO?: NullableStringFieldUpdateOperationsInput | string | null
    MIGRANTE?: NullableStringFieldUpdateOperationsInput | string | null
    TRABAJADORA_SEXUAL?: NullableStringFieldUpdateOperationsInput | string | null
    POBLACION_LGTBI?: NullableStringFieldUpdateOperationsInput | string | null
    ORIENTACION_SEXUAL?: NullableStringFieldUpdateOperationsInput | string | null
    Barrio?: NullableStringFieldUpdateOperationsInput | string | null
    confirmacion_telefono?: NullableStringFieldUpdateOperationsInput | string | null
    poll?: NullableStringFieldUpdateOperationsInput | string | null
    Clave?: NullableStringFieldUpdateOperationsInput | string | null
    codPaisResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    codMunicipioResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    codDepartamentoResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    codPaisOrigen?: NullableStringFieldUpdateOperationsInput | string | null
    codZonaTerritorialResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    incapacidad?: NullableStringFieldUpdateOperationsInput | string | null
    Capitado?: NullableEnumusuarios_CapitadoFieldUpdateOperationsInput | $Enums.usuarios_Capitado | null
    IdUsuario?: IntFieldUpdateOperationsInput | number
    IdCentro?: NullableIntFieldUpdateOperationsInput | number | null
    vacunas_completas?: NullableStringFieldUpdateOperationsInput | string | null
    intervenciones_quirurgicas?: NullableStringFieldUpdateOperationsInput | string | null
    alergia?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type usuariosCreateManyInput = {
    Carnet?: string
    codPrestador?: string | null
    Identificaci_n_usuario: string
    Tipo_identificaci_n: string
    Primer_apellido: string
    Segundo_apellido?: string | null
    Primer_nombre: string
    Segundo_nombre?: string | null
    Direcci_n?: string | null
    Tel_fono?: string | null
    Tipo_usuario: string
    Tipo_afiliado?: string | null
    C_digo_Ocupaci_n?: string | null
    Unidad_edad?: string
    Edad?: string
    Sexo: string
    Residencia?: string
    Zona_residencia?: string
    cedula_afiliado?: string | null
    Fecha_nacimient?: Date | string | null
    NHistoria?: string | null
    Estado_civil?: string | null
    Estado?: string | null
    fecha_retiro?: Date | string | null
    Ciudad?: string | null
    Sector?: string
    Nombre_acudiente?: string | null
    Telefono_acudiente?: string | null
    Antecedente_Patologico1?: string | null
    Antecedente_Patologico2?: string | null
    Antecedente_Patologico3?: string | null
    Antecedente_Quirurgico1?: string | null
    Antecedente_Quirurgico2?: string | null
    Antecedente_Familiar1?: string | null
    Antecedente_Familiar2?: string | null
    Antecedente_Familiar3?: string | null
    Hemoclasificaci_n?: string | null
    RH?: string | null
    Fecha_afiliacion?: Date | string | null
    Parentezco?: string | null
    Ciudad_cedula?: string | null
    Escalafon_afiliado?: string | null
    Discapacidad?: string | null
    Estrato?: string | null
    AL1?: number | null
    AL2?: number | null
    Cod_medico?: string | null
    Codigo_eps?: string
    Rango?: string | null
    Pagos?: string | null
    Cod_odontologo?: string | null
    Fecha_novedad?: Date | string | null
    Contrato?: string | null
    N_mero_afiliaci_n?: string | null
    Etnico?: string | null
    NumeroSemanasCotizadas?: number | null
    LugarNacimiento?: string | null
    NroHijos?: number | null
    Escolaridad?: string | null
    FechaAfiliacion?: Date | string | null
    Celular?: string | null
    CorreoElectr_nico?: string | null
    Responsable?: string | null
    Telefono_Responsable?: string | null
    Religion?: string | null
    Telefono_Secundario?: string | null
    email?: string | null
    Fecha_Creado?: string | null
    Creado_Por?: string | null
    Fecha_Modificado?: string | null
    Modificado_por?: string | null
    Fecha_Estado?: string | null
    Portabilidad?: string | null
    Fecha_Portabilidad?: string | null
    nombre_disp_asignado?: string | null
    Genero?: string | null
    Poblacion_Clave?: string | null
    Gestacion?: string | null
    Victima_del_Conflicto_armado?: string | null
    VICTIMA_DEL_MALTRATO?: string | null
    ABANDONO_SOCIAL?: string | null
    DESESCOLARIZADO?: string | null
    DESEMPLEADO?: string | null
    CARCELARIO?: string | null
    MIGRANTE?: string | null
    TRABAJADORA_SEXUAL?: string | null
    POBLACION_LGTBI?: string | null
    ORIENTACION_SEXUAL?: string | null
    Barrio?: string | null
    confirmacion_telefono?: string | null
    poll?: string | null
    Clave?: string | null
    codPaisResidencia?: string | null
    codMunicipioResidencia?: string | null
    codDepartamentoResidencia?: string | null
    codPaisOrigen?: string | null
    codZonaTerritorialResidencia?: string | null
    incapacidad?: string | null
    Capitado?: $Enums.usuarios_Capitado | null
    IdUsuario?: number
    IdCentro?: number | null
    vacunas_completas?: string | null
    intervenciones_quirurgicas?: string | null
    alergia?: string | null
  }

  export type usuariosUpdateManyMutationInput = {
    Carnet?: StringFieldUpdateOperationsInput | string
    codPrestador?: NullableStringFieldUpdateOperationsInput | string | null
    Identificaci_n_usuario?: StringFieldUpdateOperationsInput | string
    Tipo_identificaci_n?: StringFieldUpdateOperationsInput | string
    Primer_apellido?: StringFieldUpdateOperationsInput | string
    Segundo_apellido?: NullableStringFieldUpdateOperationsInput | string | null
    Primer_nombre?: StringFieldUpdateOperationsInput | string
    Segundo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    Direcci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Tel_fono?: NullableStringFieldUpdateOperationsInput | string | null
    Tipo_usuario?: StringFieldUpdateOperationsInput | string
    Tipo_afiliado?: NullableStringFieldUpdateOperationsInput | string | null
    C_digo_Ocupaci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Unidad_edad?: StringFieldUpdateOperationsInput | string
    Edad?: StringFieldUpdateOperationsInput | string
    Sexo?: StringFieldUpdateOperationsInput | string
    Residencia?: StringFieldUpdateOperationsInput | string
    Zona_residencia?: StringFieldUpdateOperationsInput | string
    cedula_afiliado?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_nacimient?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    NHistoria?: NullableStringFieldUpdateOperationsInput | string | null
    Estado_civil?: NullableStringFieldUpdateOperationsInput | string | null
    Estado?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_retiro?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Ciudad?: NullableStringFieldUpdateOperationsInput | string | null
    Sector?: StringFieldUpdateOperationsInput | string
    Nombre_acudiente?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono_acudiente?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Patologico1?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Patologico2?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Patologico3?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Quirurgico1?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Quirurgico2?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Familiar1?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Familiar2?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Familiar3?: NullableStringFieldUpdateOperationsInput | string | null
    Hemoclasificaci_n?: NullableStringFieldUpdateOperationsInput | string | null
    RH?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_afiliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Parentezco?: NullableStringFieldUpdateOperationsInput | string | null
    Ciudad_cedula?: NullableStringFieldUpdateOperationsInput | string | null
    Escalafon_afiliado?: NullableStringFieldUpdateOperationsInput | string | null
    Discapacidad?: NullableStringFieldUpdateOperationsInput | string | null
    Estrato?: NullableStringFieldUpdateOperationsInput | string | null
    AL1?: NullableIntFieldUpdateOperationsInput | number | null
    AL2?: NullableIntFieldUpdateOperationsInput | number | null
    Cod_medico?: NullableStringFieldUpdateOperationsInput | string | null
    Codigo_eps?: StringFieldUpdateOperationsInput | string
    Rango?: NullableStringFieldUpdateOperationsInput | string | null
    Pagos?: NullableStringFieldUpdateOperationsInput | string | null
    Cod_odontologo?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_novedad?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Contrato?: NullableStringFieldUpdateOperationsInput | string | null
    N_mero_afiliaci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Etnico?: NullableStringFieldUpdateOperationsInput | string | null
    NumeroSemanasCotizadas?: NullableIntFieldUpdateOperationsInput | number | null
    LugarNacimiento?: NullableStringFieldUpdateOperationsInput | string | null
    NroHijos?: NullableIntFieldUpdateOperationsInput | number | null
    Escolaridad?: NullableStringFieldUpdateOperationsInput | string | null
    FechaAfiliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Celular?: NullableStringFieldUpdateOperationsInput | string | null
    CorreoElectr_nico?: NullableStringFieldUpdateOperationsInput | string | null
    Responsable?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono_Responsable?: NullableStringFieldUpdateOperationsInput | string | null
    Religion?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono_Secundario?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Creado?: NullableStringFieldUpdateOperationsInput | string | null
    Creado_Por?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Modificado?: NullableStringFieldUpdateOperationsInput | string | null
    Modificado_por?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Estado?: NullableStringFieldUpdateOperationsInput | string | null
    Portabilidad?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Portabilidad?: NullableStringFieldUpdateOperationsInput | string | null
    nombre_disp_asignado?: NullableStringFieldUpdateOperationsInput | string | null
    Genero?: NullableStringFieldUpdateOperationsInput | string | null
    Poblacion_Clave?: NullableStringFieldUpdateOperationsInput | string | null
    Gestacion?: NullableStringFieldUpdateOperationsInput | string | null
    Victima_del_Conflicto_armado?: NullableStringFieldUpdateOperationsInput | string | null
    VICTIMA_DEL_MALTRATO?: NullableStringFieldUpdateOperationsInput | string | null
    ABANDONO_SOCIAL?: NullableStringFieldUpdateOperationsInput | string | null
    DESESCOLARIZADO?: NullableStringFieldUpdateOperationsInput | string | null
    DESEMPLEADO?: NullableStringFieldUpdateOperationsInput | string | null
    CARCELARIO?: NullableStringFieldUpdateOperationsInput | string | null
    MIGRANTE?: NullableStringFieldUpdateOperationsInput | string | null
    TRABAJADORA_SEXUAL?: NullableStringFieldUpdateOperationsInput | string | null
    POBLACION_LGTBI?: NullableStringFieldUpdateOperationsInput | string | null
    ORIENTACION_SEXUAL?: NullableStringFieldUpdateOperationsInput | string | null
    Barrio?: NullableStringFieldUpdateOperationsInput | string | null
    confirmacion_telefono?: NullableStringFieldUpdateOperationsInput | string | null
    poll?: NullableStringFieldUpdateOperationsInput | string | null
    Clave?: NullableStringFieldUpdateOperationsInput | string | null
    codPaisResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    codMunicipioResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    codDepartamentoResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    codPaisOrigen?: NullableStringFieldUpdateOperationsInput | string | null
    codZonaTerritorialResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    incapacidad?: NullableStringFieldUpdateOperationsInput | string | null
    Capitado?: NullableEnumusuarios_CapitadoFieldUpdateOperationsInput | $Enums.usuarios_Capitado | null
    IdCentro?: NullableIntFieldUpdateOperationsInput | number | null
    vacunas_completas?: NullableStringFieldUpdateOperationsInput | string | null
    intervenciones_quirurgicas?: NullableStringFieldUpdateOperationsInput | string | null
    alergia?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type usuariosUncheckedUpdateManyInput = {
    Carnet?: StringFieldUpdateOperationsInput | string
    codPrestador?: NullableStringFieldUpdateOperationsInput | string | null
    Identificaci_n_usuario?: StringFieldUpdateOperationsInput | string
    Tipo_identificaci_n?: StringFieldUpdateOperationsInput | string
    Primer_apellido?: StringFieldUpdateOperationsInput | string
    Segundo_apellido?: NullableStringFieldUpdateOperationsInput | string | null
    Primer_nombre?: StringFieldUpdateOperationsInput | string
    Segundo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    Direcci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Tel_fono?: NullableStringFieldUpdateOperationsInput | string | null
    Tipo_usuario?: StringFieldUpdateOperationsInput | string
    Tipo_afiliado?: NullableStringFieldUpdateOperationsInput | string | null
    C_digo_Ocupaci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Unidad_edad?: StringFieldUpdateOperationsInput | string
    Edad?: StringFieldUpdateOperationsInput | string
    Sexo?: StringFieldUpdateOperationsInput | string
    Residencia?: StringFieldUpdateOperationsInput | string
    Zona_residencia?: StringFieldUpdateOperationsInput | string
    cedula_afiliado?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_nacimient?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    NHistoria?: NullableStringFieldUpdateOperationsInput | string | null
    Estado_civil?: NullableStringFieldUpdateOperationsInput | string | null
    Estado?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_retiro?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Ciudad?: NullableStringFieldUpdateOperationsInput | string | null
    Sector?: StringFieldUpdateOperationsInput | string
    Nombre_acudiente?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono_acudiente?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Patologico1?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Patologico2?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Patologico3?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Quirurgico1?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Quirurgico2?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Familiar1?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Familiar2?: NullableStringFieldUpdateOperationsInput | string | null
    Antecedente_Familiar3?: NullableStringFieldUpdateOperationsInput | string | null
    Hemoclasificaci_n?: NullableStringFieldUpdateOperationsInput | string | null
    RH?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_afiliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Parentezco?: NullableStringFieldUpdateOperationsInput | string | null
    Ciudad_cedula?: NullableStringFieldUpdateOperationsInput | string | null
    Escalafon_afiliado?: NullableStringFieldUpdateOperationsInput | string | null
    Discapacidad?: NullableStringFieldUpdateOperationsInput | string | null
    Estrato?: NullableStringFieldUpdateOperationsInput | string | null
    AL1?: NullableIntFieldUpdateOperationsInput | number | null
    AL2?: NullableIntFieldUpdateOperationsInput | number | null
    Cod_medico?: NullableStringFieldUpdateOperationsInput | string | null
    Codigo_eps?: StringFieldUpdateOperationsInput | string
    Rango?: NullableStringFieldUpdateOperationsInput | string | null
    Pagos?: NullableStringFieldUpdateOperationsInput | string | null
    Cod_odontologo?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_novedad?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Contrato?: NullableStringFieldUpdateOperationsInput | string | null
    N_mero_afiliaci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Etnico?: NullableStringFieldUpdateOperationsInput | string | null
    NumeroSemanasCotizadas?: NullableIntFieldUpdateOperationsInput | number | null
    LugarNacimiento?: NullableStringFieldUpdateOperationsInput | string | null
    NroHijos?: NullableIntFieldUpdateOperationsInput | number | null
    Escolaridad?: NullableStringFieldUpdateOperationsInput | string | null
    FechaAfiliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Celular?: NullableStringFieldUpdateOperationsInput | string | null
    CorreoElectr_nico?: NullableStringFieldUpdateOperationsInput | string | null
    Responsable?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono_Responsable?: NullableStringFieldUpdateOperationsInput | string | null
    Religion?: NullableStringFieldUpdateOperationsInput | string | null
    Telefono_Secundario?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Creado?: NullableStringFieldUpdateOperationsInput | string | null
    Creado_Por?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Modificado?: NullableStringFieldUpdateOperationsInput | string | null
    Modificado_por?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Estado?: NullableStringFieldUpdateOperationsInput | string | null
    Portabilidad?: NullableStringFieldUpdateOperationsInput | string | null
    Fecha_Portabilidad?: NullableStringFieldUpdateOperationsInput | string | null
    nombre_disp_asignado?: NullableStringFieldUpdateOperationsInput | string | null
    Genero?: NullableStringFieldUpdateOperationsInput | string | null
    Poblacion_Clave?: NullableStringFieldUpdateOperationsInput | string | null
    Gestacion?: NullableStringFieldUpdateOperationsInput | string | null
    Victima_del_Conflicto_armado?: NullableStringFieldUpdateOperationsInput | string | null
    VICTIMA_DEL_MALTRATO?: NullableStringFieldUpdateOperationsInput | string | null
    ABANDONO_SOCIAL?: NullableStringFieldUpdateOperationsInput | string | null
    DESESCOLARIZADO?: NullableStringFieldUpdateOperationsInput | string | null
    DESEMPLEADO?: NullableStringFieldUpdateOperationsInput | string | null
    CARCELARIO?: NullableStringFieldUpdateOperationsInput | string | null
    MIGRANTE?: NullableStringFieldUpdateOperationsInput | string | null
    TRABAJADORA_SEXUAL?: NullableStringFieldUpdateOperationsInput | string | null
    POBLACION_LGTBI?: NullableStringFieldUpdateOperationsInput | string | null
    ORIENTACION_SEXUAL?: NullableStringFieldUpdateOperationsInput | string | null
    Barrio?: NullableStringFieldUpdateOperationsInput | string | null
    confirmacion_telefono?: NullableStringFieldUpdateOperationsInput | string | null
    poll?: NullableStringFieldUpdateOperationsInput | string | null
    Clave?: NullableStringFieldUpdateOperationsInput | string | null
    codPaisResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    codMunicipioResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    codDepartamentoResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    codPaisOrigen?: NullableStringFieldUpdateOperationsInput | string | null
    codZonaTerritorialResidencia?: NullableStringFieldUpdateOperationsInput | string | null
    incapacidad?: NullableStringFieldUpdateOperationsInput | string | null
    Capitado?: NullableEnumusuarios_CapitadoFieldUpdateOperationsInput | $Enums.usuarios_Capitado | null
    IdUsuario?: IntFieldUpdateOperationsInput | number
    IdCentro?: NullableIntFieldUpdateOperationsInput | number | null
    vacunas_completas?: NullableStringFieldUpdateOperationsInput | string | null
    intervenciones_quirurgicas?: NullableStringFieldUpdateOperationsInput | string | null
    alergia?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type empleadosCreateInput = {
    C_digo_empleado: string
    Nombre_empleado: string
    Direcci_n?: string | null
    Tel_fonos?: string | null
    Medico?: boolean | null
    EsMedico?: boolean
    Odontologo?: boolean | null
    Clave?: string | null
    Estado_Empleado?: boolean | null
    POtraEsp?: boolean | null
    Registro_medico?: string | null
    De?: string | null
    Firma?: string | null
    Registra?: boolean | null
    enfermeria?: boolean | null
    Perfil?: number | null
    Perfil2?: number | null
    phone?: string | null
    Firmaimg: Uint8Array
    consultorio?: string | null
    email?: string | null
    IdCentro?: number | null
    userpic?: Uint8Array | null
    TipoDocumento?: string | null
    Documento?: string | null
  }

  export type empleadosUncheckedCreateInput = {
    C_digo_empleado: string
    Nombre_empleado: string
    Direcci_n?: string | null
    Tel_fonos?: string | null
    Medico?: boolean | null
    EsMedico?: boolean
    Odontologo?: boolean | null
    Clave?: string | null
    Estado_Empleado?: boolean | null
    POtraEsp?: boolean | null
    Registro_medico?: string | null
    De?: string | null
    Firma?: string | null
    Registra?: boolean | null
    enfermeria?: boolean | null
    Perfil?: number | null
    Perfil2?: number | null
    phone?: string | null
    Firmaimg: Uint8Array
    consultorio?: string | null
    email?: string | null
    IdCentro?: number | null
    userpic?: Uint8Array | null
    TipoDocumento?: string | null
    Documento?: string | null
  }

  export type empleadosUpdateInput = {
    C_digo_empleado?: StringFieldUpdateOperationsInput | string
    Nombre_empleado?: StringFieldUpdateOperationsInput | string
    Direcci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Tel_fonos?: NullableStringFieldUpdateOperationsInput | string | null
    Medico?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EsMedico?: BoolFieldUpdateOperationsInput | boolean
    Odontologo?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Clave?: NullableStringFieldUpdateOperationsInput | string | null
    Estado_Empleado?: NullableBoolFieldUpdateOperationsInput | boolean | null
    POtraEsp?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Registro_medico?: NullableStringFieldUpdateOperationsInput | string | null
    De?: NullableStringFieldUpdateOperationsInput | string | null
    Firma?: NullableStringFieldUpdateOperationsInput | string | null
    Registra?: NullableBoolFieldUpdateOperationsInput | boolean | null
    enfermeria?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Perfil?: NullableIntFieldUpdateOperationsInput | number | null
    Perfil2?: NullableIntFieldUpdateOperationsInput | number | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    Firmaimg?: BytesFieldUpdateOperationsInput | Uint8Array
    consultorio?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    IdCentro?: NullableIntFieldUpdateOperationsInput | number | null
    userpic?: NullableBytesFieldUpdateOperationsInput | Uint8Array | null
    TipoDocumento?: NullableStringFieldUpdateOperationsInput | string | null
    Documento?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type empleadosUncheckedUpdateInput = {
    C_digo_empleado?: StringFieldUpdateOperationsInput | string
    Nombre_empleado?: StringFieldUpdateOperationsInput | string
    Direcci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Tel_fonos?: NullableStringFieldUpdateOperationsInput | string | null
    Medico?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EsMedico?: BoolFieldUpdateOperationsInput | boolean
    Odontologo?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Clave?: NullableStringFieldUpdateOperationsInput | string | null
    Estado_Empleado?: NullableBoolFieldUpdateOperationsInput | boolean | null
    POtraEsp?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Registro_medico?: NullableStringFieldUpdateOperationsInput | string | null
    De?: NullableStringFieldUpdateOperationsInput | string | null
    Firma?: NullableStringFieldUpdateOperationsInput | string | null
    Registra?: NullableBoolFieldUpdateOperationsInput | boolean | null
    enfermeria?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Perfil?: NullableIntFieldUpdateOperationsInput | number | null
    Perfil2?: NullableIntFieldUpdateOperationsInput | number | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    Firmaimg?: BytesFieldUpdateOperationsInput | Uint8Array
    consultorio?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    IdCentro?: NullableIntFieldUpdateOperationsInput | number | null
    userpic?: NullableBytesFieldUpdateOperationsInput | Uint8Array | null
    TipoDocumento?: NullableStringFieldUpdateOperationsInput | string | null
    Documento?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type empleadosCreateManyInput = {
    C_digo_empleado: string
    Nombre_empleado: string
    Direcci_n?: string | null
    Tel_fonos?: string | null
    Medico?: boolean | null
    EsMedico?: boolean
    Odontologo?: boolean | null
    Clave?: string | null
    Estado_Empleado?: boolean | null
    POtraEsp?: boolean | null
    Registro_medico?: string | null
    De?: string | null
    Firma?: string | null
    Registra?: boolean | null
    enfermeria?: boolean | null
    Perfil?: number | null
    Perfil2?: number | null
    phone?: string | null
    Firmaimg: Uint8Array
    consultorio?: string | null
    email?: string | null
    IdCentro?: number | null
    userpic?: Uint8Array | null
    TipoDocumento?: string | null
    Documento?: string | null
  }

  export type empleadosUpdateManyMutationInput = {
    C_digo_empleado?: StringFieldUpdateOperationsInput | string
    Nombre_empleado?: StringFieldUpdateOperationsInput | string
    Direcci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Tel_fonos?: NullableStringFieldUpdateOperationsInput | string | null
    Medico?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EsMedico?: BoolFieldUpdateOperationsInput | boolean
    Odontologo?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Clave?: NullableStringFieldUpdateOperationsInput | string | null
    Estado_Empleado?: NullableBoolFieldUpdateOperationsInput | boolean | null
    POtraEsp?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Registro_medico?: NullableStringFieldUpdateOperationsInput | string | null
    De?: NullableStringFieldUpdateOperationsInput | string | null
    Firma?: NullableStringFieldUpdateOperationsInput | string | null
    Registra?: NullableBoolFieldUpdateOperationsInput | boolean | null
    enfermeria?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Perfil?: NullableIntFieldUpdateOperationsInput | number | null
    Perfil2?: NullableIntFieldUpdateOperationsInput | number | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    Firmaimg?: BytesFieldUpdateOperationsInput | Uint8Array
    consultorio?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    IdCentro?: NullableIntFieldUpdateOperationsInput | number | null
    userpic?: NullableBytesFieldUpdateOperationsInput | Uint8Array | null
    TipoDocumento?: NullableStringFieldUpdateOperationsInput | string | null
    Documento?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type empleadosUncheckedUpdateManyInput = {
    C_digo_empleado?: StringFieldUpdateOperationsInput | string
    Nombre_empleado?: StringFieldUpdateOperationsInput | string
    Direcci_n?: NullableStringFieldUpdateOperationsInput | string | null
    Tel_fonos?: NullableStringFieldUpdateOperationsInput | string | null
    Medico?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EsMedico?: BoolFieldUpdateOperationsInput | boolean
    Odontologo?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Clave?: NullableStringFieldUpdateOperationsInput | string | null
    Estado_Empleado?: NullableBoolFieldUpdateOperationsInput | boolean | null
    POtraEsp?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Registro_medico?: NullableStringFieldUpdateOperationsInput | string | null
    De?: NullableStringFieldUpdateOperationsInput | string | null
    Firma?: NullableStringFieldUpdateOperationsInput | string | null
    Registra?: NullableBoolFieldUpdateOperationsInput | boolean | null
    enfermeria?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Perfil?: NullableIntFieldUpdateOperationsInput | number | null
    Perfil2?: NullableIntFieldUpdateOperationsInput | number | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    Firmaimg?: BytesFieldUpdateOperationsInput | Uint8Array
    consultorio?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    IdCentro?: NullableIntFieldUpdateOperationsInput | number | null
    userpic?: NullableBytesFieldUpdateOperationsInput | Uint8Array | null
    TipoDocumento?: NullableStringFieldUpdateOperationsInput | string | null
    Documento?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type especialidad_empleadosCreateInput = {
    Consecutivo?: number
    C_digo_empleado: string
    C_digo_especialidad: string
    IdCentro: number
    Principal?: boolean | null
    Cups?: string | null
    regimen_atencion?: string | null
    MinutosXConsulta?: number | null
    NoPacientes?: number | null
    fecha_final?: Date | string | null
    fecha_inicial?: Date | string | null
    hf_m?: string | null
    hf_t?: string | null
    hi_m?: string | null
    hi_t?: string | null
    IdSede?: number | null
    bot?: string | null
    contrato?: string | null
  }

  export type especialidad_empleadosUncheckedCreateInput = {
    Consecutivo?: number
    C_digo_empleado: string
    C_digo_especialidad: string
    IdCentro: number
    Principal?: boolean | null
    Cups?: string | null
    regimen_atencion?: string | null
    MinutosXConsulta?: number | null
    NoPacientes?: number | null
    fecha_final?: Date | string | null
    fecha_inicial?: Date | string | null
    hf_m?: string | null
    hf_t?: string | null
    hi_m?: string | null
    hi_t?: string | null
    IdSede?: number | null
    bot?: string | null
    contrato?: string | null
  }

  export type especialidad_empleadosUpdateInput = {
    C_digo_empleado?: StringFieldUpdateOperationsInput | string
    C_digo_especialidad?: StringFieldUpdateOperationsInput | string
    IdCentro?: IntFieldUpdateOperationsInput | number
    Principal?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Cups?: NullableStringFieldUpdateOperationsInput | string | null
    regimen_atencion?: NullableStringFieldUpdateOperationsInput | string | null
    MinutosXConsulta?: NullableIntFieldUpdateOperationsInput | number | null
    NoPacientes?: NullableIntFieldUpdateOperationsInput | number | null
    fecha_final?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_inicial?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    hf_m?: NullableStringFieldUpdateOperationsInput | string | null
    hf_t?: NullableStringFieldUpdateOperationsInput | string | null
    hi_m?: NullableStringFieldUpdateOperationsInput | string | null
    hi_t?: NullableStringFieldUpdateOperationsInput | string | null
    IdSede?: NullableIntFieldUpdateOperationsInput | number | null
    bot?: NullableStringFieldUpdateOperationsInput | string | null
    contrato?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type especialidad_empleadosUncheckedUpdateInput = {
    Consecutivo?: IntFieldUpdateOperationsInput | number
    C_digo_empleado?: StringFieldUpdateOperationsInput | string
    C_digo_especialidad?: StringFieldUpdateOperationsInput | string
    IdCentro?: IntFieldUpdateOperationsInput | number
    Principal?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Cups?: NullableStringFieldUpdateOperationsInput | string | null
    regimen_atencion?: NullableStringFieldUpdateOperationsInput | string | null
    MinutosXConsulta?: NullableIntFieldUpdateOperationsInput | number | null
    NoPacientes?: NullableIntFieldUpdateOperationsInput | number | null
    fecha_final?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_inicial?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    hf_m?: NullableStringFieldUpdateOperationsInput | string | null
    hf_t?: NullableStringFieldUpdateOperationsInput | string | null
    hi_m?: NullableStringFieldUpdateOperationsInput | string | null
    hi_t?: NullableStringFieldUpdateOperationsInput | string | null
    IdSede?: NullableIntFieldUpdateOperationsInput | number | null
    bot?: NullableStringFieldUpdateOperationsInput | string | null
    contrato?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type especialidad_empleadosCreateManyInput = {
    Consecutivo?: number
    C_digo_empleado: string
    C_digo_especialidad: string
    IdCentro: number
    Principal?: boolean | null
    Cups?: string | null
    regimen_atencion?: string | null
    MinutosXConsulta?: number | null
    NoPacientes?: number | null
    fecha_final?: Date | string | null
    fecha_inicial?: Date | string | null
    hf_m?: string | null
    hf_t?: string | null
    hi_m?: string | null
    hi_t?: string | null
    IdSede?: number | null
    bot?: string | null
    contrato?: string | null
  }

  export type especialidad_empleadosUpdateManyMutationInput = {
    C_digo_empleado?: StringFieldUpdateOperationsInput | string
    C_digo_especialidad?: StringFieldUpdateOperationsInput | string
    IdCentro?: IntFieldUpdateOperationsInput | number
    Principal?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Cups?: NullableStringFieldUpdateOperationsInput | string | null
    regimen_atencion?: NullableStringFieldUpdateOperationsInput | string | null
    MinutosXConsulta?: NullableIntFieldUpdateOperationsInput | number | null
    NoPacientes?: NullableIntFieldUpdateOperationsInput | number | null
    fecha_final?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_inicial?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    hf_m?: NullableStringFieldUpdateOperationsInput | string | null
    hf_t?: NullableStringFieldUpdateOperationsInput | string | null
    hi_m?: NullableStringFieldUpdateOperationsInput | string | null
    hi_t?: NullableStringFieldUpdateOperationsInput | string | null
    IdSede?: NullableIntFieldUpdateOperationsInput | number | null
    bot?: NullableStringFieldUpdateOperationsInput | string | null
    contrato?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type especialidad_empleadosUncheckedUpdateManyInput = {
    Consecutivo?: IntFieldUpdateOperationsInput | number
    C_digo_empleado?: StringFieldUpdateOperationsInput | string
    C_digo_especialidad?: StringFieldUpdateOperationsInput | string
    IdCentro?: IntFieldUpdateOperationsInput | number
    Principal?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Cups?: NullableStringFieldUpdateOperationsInput | string | null
    regimen_atencion?: NullableStringFieldUpdateOperationsInput | string | null
    MinutosXConsulta?: NullableIntFieldUpdateOperationsInput | number | null
    NoPacientes?: NullableIntFieldUpdateOperationsInput | number | null
    fecha_final?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_inicial?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    hf_m?: NullableStringFieldUpdateOperationsInput | string | null
    hf_t?: NullableStringFieldUpdateOperationsInput | string | null
    hi_m?: NullableStringFieldUpdateOperationsInput | string | null
    hi_t?: NullableStringFieldUpdateOperationsInput | string | null
    IdSede?: NullableIntFieldUpdateOperationsInput | number | null
    bot?: NullableStringFieldUpdateOperationsInput | string | null
    contrato?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type especialidadcupsempleadoCreateInput = {
    CodigoEmpleado: string
    CodigoEspecialidad: string
    Cups: string
    Porcentaje?: number | null
    Valor?: number | null
  }

  export type especialidadcupsempleadoUncheckedCreateInput = {
    CodigoEmpleado: string
    CodigoEspecialidad: string
    Cups: string
    Porcentaje?: number | null
    Valor?: number | null
  }

  export type especialidadcupsempleadoUpdateInput = {
    CodigoEmpleado?: StringFieldUpdateOperationsInput | string
    CodigoEspecialidad?: StringFieldUpdateOperationsInput | string
    Cups?: StringFieldUpdateOperationsInput | string
    Porcentaje?: NullableFloatFieldUpdateOperationsInput | number | null
    Valor?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type especialidadcupsempleadoUncheckedUpdateInput = {
    CodigoEmpleado?: StringFieldUpdateOperationsInput | string
    CodigoEspecialidad?: StringFieldUpdateOperationsInput | string
    Cups?: StringFieldUpdateOperationsInput | string
    Porcentaje?: NullableFloatFieldUpdateOperationsInput | number | null
    Valor?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type especialidadcupsempleadoCreateManyInput = {
    CodigoEmpleado: string
    CodigoEspecialidad: string
    Cups: string
    Porcentaje?: number | null
    Valor?: number | null
  }

  export type especialidadcupsempleadoUpdateManyMutationInput = {
    CodigoEmpleado?: StringFieldUpdateOperationsInput | string
    CodigoEspecialidad?: StringFieldUpdateOperationsInput | string
    Cups?: StringFieldUpdateOperationsInput | string
    Porcentaje?: NullableFloatFieldUpdateOperationsInput | number | null
    Valor?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type especialidadcupsempleadoUncheckedUpdateManyInput = {
    CodigoEmpleado?: StringFieldUpdateOperationsInput | string
    CodigoEspecialidad?: StringFieldUpdateOperationsInput | string
    Cups?: StringFieldUpdateOperationsInput | string
    Porcentaje?: NullableFloatFieldUpdateOperationsInput | number | null
    Valor?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type tventidadesCreateInput = {
    Codigo: string
    NombreEntidad?: string | null
    Departamento?: string | null
    Municipio?: string | null
    Digitado?: boolean | null
    Nit: string
    Dv: string
    email: string
    telefono: string
    Direccion: string
  }

  export type tventidadesUncheckedCreateInput = {
    Codigo: string
    NombreEntidad?: string | null
    Departamento?: string | null
    Municipio?: string | null
    Digitado?: boolean | null
    Nit: string
    Dv: string
    email: string
    telefono: string
    Direccion: string
  }

  export type tventidadesUpdateInput = {
    Codigo?: StringFieldUpdateOperationsInput | string
    NombreEntidad?: NullableStringFieldUpdateOperationsInput | string | null
    Departamento?: NullableStringFieldUpdateOperationsInput | string | null
    Municipio?: NullableStringFieldUpdateOperationsInput | string | null
    Digitado?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Nit?: StringFieldUpdateOperationsInput | string
    Dv?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: StringFieldUpdateOperationsInput | string
    Direccion?: StringFieldUpdateOperationsInput | string
  }

  export type tventidadesUncheckedUpdateInput = {
    Codigo?: StringFieldUpdateOperationsInput | string
    NombreEntidad?: NullableStringFieldUpdateOperationsInput | string | null
    Departamento?: NullableStringFieldUpdateOperationsInput | string | null
    Municipio?: NullableStringFieldUpdateOperationsInput | string | null
    Digitado?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Nit?: StringFieldUpdateOperationsInput | string
    Dv?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: StringFieldUpdateOperationsInput | string
    Direccion?: StringFieldUpdateOperationsInput | string
  }

  export type tventidadesCreateManyInput = {
    Codigo: string
    NombreEntidad?: string | null
    Departamento?: string | null
    Municipio?: string | null
    Digitado?: boolean | null
    Nit: string
    Dv: string
    email: string
    telefono: string
    Direccion: string
  }

  export type tventidadesUpdateManyMutationInput = {
    Codigo?: StringFieldUpdateOperationsInput | string
    NombreEntidad?: NullableStringFieldUpdateOperationsInput | string | null
    Departamento?: NullableStringFieldUpdateOperationsInput | string | null
    Municipio?: NullableStringFieldUpdateOperationsInput | string | null
    Digitado?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Nit?: StringFieldUpdateOperationsInput | string
    Dv?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: StringFieldUpdateOperationsInput | string
    Direccion?: StringFieldUpdateOperationsInput | string
  }

  export type tventidadesUncheckedUpdateManyInput = {
    Codigo?: StringFieldUpdateOperationsInput | string
    NombreEntidad?: NullableStringFieldUpdateOperationsInput | string | null
    Departamento?: NullableStringFieldUpdateOperationsInput | string | null
    Municipio?: NullableStringFieldUpdateOperationsInput | string | null
    Digitado?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Nit?: StringFieldUpdateOperationsInput | string
    Dv?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: StringFieldUpdateOperationsInput | string
    Direccion?: StringFieldUpdateOperationsInput | string
  }

  export type tvespecialidadesCreateInput = {
    CodigoEspecialidad: string
    Especialidad?: string | null
    CUPS?: string | null
    CodigoServicio?: number | null
  }

  export type tvespecialidadesUncheckedCreateInput = {
    CodigoEspecialidad: string
    Especialidad?: string | null
    CUPS?: string | null
    CodigoServicio?: number | null
  }

  export type tvespecialidadesUpdateInput = {
    CodigoEspecialidad?: StringFieldUpdateOperationsInput | string
    Especialidad?: NullableStringFieldUpdateOperationsInput | string | null
    CUPS?: NullableStringFieldUpdateOperationsInput | string | null
    CodigoServicio?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type tvespecialidadesUncheckedUpdateInput = {
    CodigoEspecialidad?: StringFieldUpdateOperationsInput | string
    Especialidad?: NullableStringFieldUpdateOperationsInput | string | null
    CUPS?: NullableStringFieldUpdateOperationsInput | string | null
    CodigoServicio?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type tvespecialidadesCreateManyInput = {
    CodigoEspecialidad: string
    Especialidad?: string | null
    CUPS?: string | null
    CodigoServicio?: number | null
  }

  export type tvespecialidadesUpdateManyMutationInput = {
    CodigoEspecialidad?: StringFieldUpdateOperationsInput | string
    Especialidad?: NullableStringFieldUpdateOperationsInput | string | null
    CUPS?: NullableStringFieldUpdateOperationsInput | string | null
    CodigoServicio?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type tvespecialidadesUncheckedUpdateManyInput = {
    CodigoEspecialidad?: StringFieldUpdateOperationsInput | string
    Especialidad?: NullableStringFieldUpdateOperationsInput | string | null
    CUPS?: NullableStringFieldUpdateOperationsInput | string | null
    CodigoServicio?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type tbldetalleremisionCreateInput = {
    IdOrden?: number | null
    CodItem?: number | null
    Descripcion?: string | null
    CodServicio?: number | null
    Ejecutada?: number | null
    Fecha_Ejecutada?: Date | string | null
    Hora_Ejecutada?: Date | string | null
    Ejecutada_por?: string | null
    Observaciones?: string | null
    Mostrar?: number | null
    IdMedicoOrdena?: string | null
  }

  export type tbldetalleremisionUncheckedCreateInput = {
    Id?: number
    IdOrden?: number | null
    CodItem?: number | null
    Descripcion?: string | null
    CodServicio?: number | null
    Ejecutada?: number | null
    Fecha_Ejecutada?: Date | string | null
    Hora_Ejecutada?: Date | string | null
    Ejecutada_por?: string | null
    Observaciones?: string | null
    Mostrar?: number | null
    IdMedicoOrdena?: string | null
  }

  export type tbldetalleremisionUpdateInput = {
    IdOrden?: NullableIntFieldUpdateOperationsInput | number | null
    CodItem?: NullableIntFieldUpdateOperationsInput | number | null
    Descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    CodServicio?: NullableIntFieldUpdateOperationsInput | number | null
    Ejecutada?: NullableIntFieldUpdateOperationsInput | number | null
    Fecha_Ejecutada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Hora_Ejecutada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Ejecutada_por?: NullableStringFieldUpdateOperationsInput | string | null
    Observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    Mostrar?: NullableIntFieldUpdateOperationsInput | number | null
    IdMedicoOrdena?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tbldetalleremisionUncheckedUpdateInput = {
    Id?: IntFieldUpdateOperationsInput | number
    IdOrden?: NullableIntFieldUpdateOperationsInput | number | null
    CodItem?: NullableIntFieldUpdateOperationsInput | number | null
    Descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    CodServicio?: NullableIntFieldUpdateOperationsInput | number | null
    Ejecutada?: NullableIntFieldUpdateOperationsInput | number | null
    Fecha_Ejecutada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Hora_Ejecutada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Ejecutada_por?: NullableStringFieldUpdateOperationsInput | string | null
    Observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    Mostrar?: NullableIntFieldUpdateOperationsInput | number | null
    IdMedicoOrdena?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tbldetalleremisionCreateManyInput = {
    Id?: number
    IdOrden?: number | null
    CodItem?: number | null
    Descripcion?: string | null
    CodServicio?: number | null
    Ejecutada?: number | null
    Fecha_Ejecutada?: Date | string | null
    Hora_Ejecutada?: Date | string | null
    Ejecutada_por?: string | null
    Observaciones?: string | null
    Mostrar?: number | null
    IdMedicoOrdena?: string | null
  }

  export type tbldetalleremisionUpdateManyMutationInput = {
    IdOrden?: NullableIntFieldUpdateOperationsInput | number | null
    CodItem?: NullableIntFieldUpdateOperationsInput | number | null
    Descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    CodServicio?: NullableIntFieldUpdateOperationsInput | number | null
    Ejecutada?: NullableIntFieldUpdateOperationsInput | number | null
    Fecha_Ejecutada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Hora_Ejecutada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Ejecutada_por?: NullableStringFieldUpdateOperationsInput | string | null
    Observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    Mostrar?: NullableIntFieldUpdateOperationsInput | number | null
    IdMedicoOrdena?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tbldetalleremisionUncheckedUpdateManyInput = {
    Id?: IntFieldUpdateOperationsInput | number
    IdOrden?: NullableIntFieldUpdateOperationsInput | number | null
    CodItem?: NullableIntFieldUpdateOperationsInput | number | null
    Descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    CodServicio?: NullableIntFieldUpdateOperationsInput | number | null
    Ejecutada?: NullableIntFieldUpdateOperationsInput | number | null
    Fecha_Ejecutada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Hora_Ejecutada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Ejecutada_por?: NullableStringFieldUpdateOperationsInput | string | null
    Observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    Mostrar?: NullableIntFieldUpdateOperationsInput | number | null
    IdMedicoOrdena?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type agendaOrderByRelevanceInput = {
    fields: agendaOrderByRelevanceFieldEnum | agendaOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type agendaFecha_citaIdhoraIdmedicoIdSedeCompoundUniqueInput = {
    fecha_cita: Date | string
    idhora: string
    idmedico: string
    IdSede: number
  }

  export type agendaCountOrderByAggregateInput = {
    idagenda?: SortOrder
    IdModalidad?: SortOrder
    fecha_solicitud?: SortOrder
    fecha_cita?: SortOrder
    idhora?: SortOrder
    idmedico?: SortOrder
    idusuario?: SortOrder
    Telefono?: SortOrder
    Cumplida?: SortOrder
    NoAdmision?: SortOrder
    TipoCita?: SortOrder
    AsignadaPor?: SortOrder
    CanceldaPor?: SortOrder
    Fecha_cancelacion?: SortOrder
    TipoContrato?: SortOrder
    Entidad?: SortOrder
    MedioSolicitud?: SortOrder
    Finalidad?: SortOrder
    Estado?: SortOrder
    TipoAgenda?: SortOrder
    Activada_por?: SortOrder
    Fecha_Activacion?: SortOrder
    Gestionada?: SortOrder
    Hora_Activacion?: SortOrder
    LlegoTarde?: SortOrder
    notificacionrecordatorio?: SortOrder
    notificacioncancelacion?: SortOrder
    notificacion_encuesta?: SortOrder
    Programa?: SortOrder
    clase_cita?: SortOrder
    IdCentro?: SortOrder
    IdSede?: SortOrder
    Bloqueada_Por?: SortOrder
    fecha_bloqueo?: SortOrder
    cancelada_por?: SortOrder
    paciente_cancelada?: SortOrder
    fecha_cancelada?: SortOrder
  }

  export type agendaAvgOrderByAggregateInput = {
    idagenda?: SortOrder
    IdModalidad?: SortOrder
    Cumplida?: SortOrder
    NoAdmision?: SortOrder
    Gestionada?: SortOrder
    IdCentro?: SortOrder
    IdSede?: SortOrder
  }

  export type agendaMaxOrderByAggregateInput = {
    idagenda?: SortOrder
    IdModalidad?: SortOrder
    fecha_solicitud?: SortOrder
    fecha_cita?: SortOrder
    idhora?: SortOrder
    idmedico?: SortOrder
    idusuario?: SortOrder
    Telefono?: SortOrder
    Cumplida?: SortOrder
    NoAdmision?: SortOrder
    TipoCita?: SortOrder
    AsignadaPor?: SortOrder
    CanceldaPor?: SortOrder
    Fecha_cancelacion?: SortOrder
    TipoContrato?: SortOrder
    Entidad?: SortOrder
    MedioSolicitud?: SortOrder
    Finalidad?: SortOrder
    Estado?: SortOrder
    TipoAgenda?: SortOrder
    Activada_por?: SortOrder
    Fecha_Activacion?: SortOrder
    Gestionada?: SortOrder
    Hora_Activacion?: SortOrder
    LlegoTarde?: SortOrder
    notificacionrecordatorio?: SortOrder
    notificacioncancelacion?: SortOrder
    notificacion_encuesta?: SortOrder
    Programa?: SortOrder
    clase_cita?: SortOrder
    IdCentro?: SortOrder
    IdSede?: SortOrder
    Bloqueada_Por?: SortOrder
    fecha_bloqueo?: SortOrder
    cancelada_por?: SortOrder
    paciente_cancelada?: SortOrder
    fecha_cancelada?: SortOrder
  }

  export type agendaMinOrderByAggregateInput = {
    idagenda?: SortOrder
    IdModalidad?: SortOrder
    fecha_solicitud?: SortOrder
    fecha_cita?: SortOrder
    idhora?: SortOrder
    idmedico?: SortOrder
    idusuario?: SortOrder
    Telefono?: SortOrder
    Cumplida?: SortOrder
    NoAdmision?: SortOrder
    TipoCita?: SortOrder
    AsignadaPor?: SortOrder
    CanceldaPor?: SortOrder
    Fecha_cancelacion?: SortOrder
    TipoContrato?: SortOrder
    Entidad?: SortOrder
    MedioSolicitud?: SortOrder
    Finalidad?: SortOrder
    Estado?: SortOrder
    TipoAgenda?: SortOrder
    Activada_por?: SortOrder
    Fecha_Activacion?: SortOrder
    Gestionada?: SortOrder
    Hora_Activacion?: SortOrder
    LlegoTarde?: SortOrder
    notificacionrecordatorio?: SortOrder
    notificacioncancelacion?: SortOrder
    notificacion_encuesta?: SortOrder
    Programa?: SortOrder
    clase_cita?: SortOrder
    IdCentro?: SortOrder
    IdSede?: SortOrder
    Bloqueada_Por?: SortOrder
    fecha_bloqueo?: SortOrder
    cancelada_por?: SortOrder
    paciente_cancelada?: SortOrder
    fecha_cancelada?: SortOrder
  }

  export type agendaSumOrderByAggregateInput = {
    idagenda?: SortOrder
    IdModalidad?: SortOrder
    Cumplida?: SortOrder
    NoAdmision?: SortOrder
    Gestionada?: SortOrder
    IdCentro?: SortOrder
    IdSede?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type Enumusuarios_CapitadoNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.usuarios_Capitado | Enumusuarios_CapitadoFieldRefInput<$PrismaModel> | null
    in?: $Enums.usuarios_Capitado[] | null
    notIn?: $Enums.usuarios_Capitado[] | null
    not?: NestedEnumusuarios_CapitadoNullableFilter<$PrismaModel> | $Enums.usuarios_Capitado | null
  }

  export type usuariosOrderByRelevanceInput = {
    fields: usuariosOrderByRelevanceFieldEnum | usuariosOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type usuariosIdentificaci_n_usuarioTipo_identificaci_nCompoundUniqueInput = {
    Identificaci_n_usuario: string
    Tipo_identificaci_n: string
  }

  export type usuariosCountOrderByAggregateInput = {
    Carnet?: SortOrder
    codPrestador?: SortOrder
    Identificaci_n_usuario?: SortOrder
    Tipo_identificaci_n?: SortOrder
    Primer_apellido?: SortOrder
    Segundo_apellido?: SortOrder
    Primer_nombre?: SortOrder
    Segundo_nombre?: SortOrder
    Direcci_n?: SortOrder
    Tel_fono?: SortOrder
    Tipo_usuario?: SortOrder
    Tipo_afiliado?: SortOrder
    C_digo_Ocupaci_n?: SortOrder
    Unidad_edad?: SortOrder
    Edad?: SortOrder
    Sexo?: SortOrder
    Residencia?: SortOrder
    Zona_residencia?: SortOrder
    cedula_afiliado?: SortOrder
    Fecha_nacimient?: SortOrder
    NHistoria?: SortOrder
    Estado_civil?: SortOrder
    Estado?: SortOrder
    fecha_retiro?: SortOrder
    Ciudad?: SortOrder
    Sector?: SortOrder
    Nombre_acudiente?: SortOrder
    Telefono_acudiente?: SortOrder
    Antecedente_Patologico1?: SortOrder
    Antecedente_Patologico2?: SortOrder
    Antecedente_Patologico3?: SortOrder
    Antecedente_Quirurgico1?: SortOrder
    Antecedente_Quirurgico2?: SortOrder
    Antecedente_Familiar1?: SortOrder
    Antecedente_Familiar2?: SortOrder
    Antecedente_Familiar3?: SortOrder
    Hemoclasificaci_n?: SortOrder
    RH?: SortOrder
    Fecha_afiliacion?: SortOrder
    Parentezco?: SortOrder
    Ciudad_cedula?: SortOrder
    Escalafon_afiliado?: SortOrder
    Discapacidad?: SortOrder
    Estrato?: SortOrder
    AL1?: SortOrder
    AL2?: SortOrder
    Cod_medico?: SortOrder
    Codigo_eps?: SortOrder
    Rango?: SortOrder
    Pagos?: SortOrder
    Cod_odontologo?: SortOrder
    Fecha_novedad?: SortOrder
    Contrato?: SortOrder
    N_mero_afiliaci_n?: SortOrder
    Etnico?: SortOrder
    NumeroSemanasCotizadas?: SortOrder
    LugarNacimiento?: SortOrder
    NroHijos?: SortOrder
    Escolaridad?: SortOrder
    FechaAfiliacion?: SortOrder
    Celular?: SortOrder
    CorreoElectr_nico?: SortOrder
    Responsable?: SortOrder
    Telefono_Responsable?: SortOrder
    Religion?: SortOrder
    Telefono_Secundario?: SortOrder
    email?: SortOrder
    Fecha_Creado?: SortOrder
    Creado_Por?: SortOrder
    Fecha_Modificado?: SortOrder
    Modificado_por?: SortOrder
    Fecha_Estado?: SortOrder
    Portabilidad?: SortOrder
    Fecha_Portabilidad?: SortOrder
    nombre_disp_asignado?: SortOrder
    Genero?: SortOrder
    Poblacion_Clave?: SortOrder
    Gestacion?: SortOrder
    Victima_del_Conflicto_armado?: SortOrder
    VICTIMA_DEL_MALTRATO?: SortOrder
    ABANDONO_SOCIAL?: SortOrder
    DESESCOLARIZADO?: SortOrder
    DESEMPLEADO?: SortOrder
    CARCELARIO?: SortOrder
    MIGRANTE?: SortOrder
    TRABAJADORA_SEXUAL?: SortOrder
    POBLACION_LGTBI?: SortOrder
    ORIENTACION_SEXUAL?: SortOrder
    Barrio?: SortOrder
    confirmacion_telefono?: SortOrder
    poll?: SortOrder
    Clave?: SortOrder
    codPaisResidencia?: SortOrder
    codMunicipioResidencia?: SortOrder
    codDepartamentoResidencia?: SortOrder
    codPaisOrigen?: SortOrder
    codZonaTerritorialResidencia?: SortOrder
    incapacidad?: SortOrder
    Capitado?: SortOrder
    IdUsuario?: SortOrder
    IdCentro?: SortOrder
    vacunas_completas?: SortOrder
    intervenciones_quirurgicas?: SortOrder
    alergia?: SortOrder
  }

  export type usuariosAvgOrderByAggregateInput = {
    AL1?: SortOrder
    AL2?: SortOrder
    NumeroSemanasCotizadas?: SortOrder
    NroHijos?: SortOrder
    IdUsuario?: SortOrder
    IdCentro?: SortOrder
  }

  export type usuariosMaxOrderByAggregateInput = {
    Carnet?: SortOrder
    codPrestador?: SortOrder
    Identificaci_n_usuario?: SortOrder
    Tipo_identificaci_n?: SortOrder
    Primer_apellido?: SortOrder
    Segundo_apellido?: SortOrder
    Primer_nombre?: SortOrder
    Segundo_nombre?: SortOrder
    Direcci_n?: SortOrder
    Tel_fono?: SortOrder
    Tipo_usuario?: SortOrder
    Tipo_afiliado?: SortOrder
    C_digo_Ocupaci_n?: SortOrder
    Unidad_edad?: SortOrder
    Edad?: SortOrder
    Sexo?: SortOrder
    Residencia?: SortOrder
    Zona_residencia?: SortOrder
    cedula_afiliado?: SortOrder
    Fecha_nacimient?: SortOrder
    NHistoria?: SortOrder
    Estado_civil?: SortOrder
    Estado?: SortOrder
    fecha_retiro?: SortOrder
    Ciudad?: SortOrder
    Sector?: SortOrder
    Nombre_acudiente?: SortOrder
    Telefono_acudiente?: SortOrder
    Antecedente_Patologico1?: SortOrder
    Antecedente_Patologico2?: SortOrder
    Antecedente_Patologico3?: SortOrder
    Antecedente_Quirurgico1?: SortOrder
    Antecedente_Quirurgico2?: SortOrder
    Antecedente_Familiar1?: SortOrder
    Antecedente_Familiar2?: SortOrder
    Antecedente_Familiar3?: SortOrder
    Hemoclasificaci_n?: SortOrder
    RH?: SortOrder
    Fecha_afiliacion?: SortOrder
    Parentezco?: SortOrder
    Ciudad_cedula?: SortOrder
    Escalafon_afiliado?: SortOrder
    Discapacidad?: SortOrder
    Estrato?: SortOrder
    AL1?: SortOrder
    AL2?: SortOrder
    Cod_medico?: SortOrder
    Codigo_eps?: SortOrder
    Rango?: SortOrder
    Pagos?: SortOrder
    Cod_odontologo?: SortOrder
    Fecha_novedad?: SortOrder
    Contrato?: SortOrder
    N_mero_afiliaci_n?: SortOrder
    Etnico?: SortOrder
    NumeroSemanasCotizadas?: SortOrder
    LugarNacimiento?: SortOrder
    NroHijos?: SortOrder
    Escolaridad?: SortOrder
    FechaAfiliacion?: SortOrder
    Celular?: SortOrder
    CorreoElectr_nico?: SortOrder
    Responsable?: SortOrder
    Telefono_Responsable?: SortOrder
    Religion?: SortOrder
    Telefono_Secundario?: SortOrder
    email?: SortOrder
    Fecha_Creado?: SortOrder
    Creado_Por?: SortOrder
    Fecha_Modificado?: SortOrder
    Modificado_por?: SortOrder
    Fecha_Estado?: SortOrder
    Portabilidad?: SortOrder
    Fecha_Portabilidad?: SortOrder
    nombre_disp_asignado?: SortOrder
    Genero?: SortOrder
    Poblacion_Clave?: SortOrder
    Gestacion?: SortOrder
    Victima_del_Conflicto_armado?: SortOrder
    VICTIMA_DEL_MALTRATO?: SortOrder
    ABANDONO_SOCIAL?: SortOrder
    DESESCOLARIZADO?: SortOrder
    DESEMPLEADO?: SortOrder
    CARCELARIO?: SortOrder
    MIGRANTE?: SortOrder
    TRABAJADORA_SEXUAL?: SortOrder
    POBLACION_LGTBI?: SortOrder
    ORIENTACION_SEXUAL?: SortOrder
    Barrio?: SortOrder
    confirmacion_telefono?: SortOrder
    poll?: SortOrder
    Clave?: SortOrder
    codPaisResidencia?: SortOrder
    codMunicipioResidencia?: SortOrder
    codDepartamentoResidencia?: SortOrder
    codPaisOrigen?: SortOrder
    codZonaTerritorialResidencia?: SortOrder
    incapacidad?: SortOrder
    Capitado?: SortOrder
    IdUsuario?: SortOrder
    IdCentro?: SortOrder
    vacunas_completas?: SortOrder
    intervenciones_quirurgicas?: SortOrder
    alergia?: SortOrder
  }

  export type usuariosMinOrderByAggregateInput = {
    Carnet?: SortOrder
    codPrestador?: SortOrder
    Identificaci_n_usuario?: SortOrder
    Tipo_identificaci_n?: SortOrder
    Primer_apellido?: SortOrder
    Segundo_apellido?: SortOrder
    Primer_nombre?: SortOrder
    Segundo_nombre?: SortOrder
    Direcci_n?: SortOrder
    Tel_fono?: SortOrder
    Tipo_usuario?: SortOrder
    Tipo_afiliado?: SortOrder
    C_digo_Ocupaci_n?: SortOrder
    Unidad_edad?: SortOrder
    Edad?: SortOrder
    Sexo?: SortOrder
    Residencia?: SortOrder
    Zona_residencia?: SortOrder
    cedula_afiliado?: SortOrder
    Fecha_nacimient?: SortOrder
    NHistoria?: SortOrder
    Estado_civil?: SortOrder
    Estado?: SortOrder
    fecha_retiro?: SortOrder
    Ciudad?: SortOrder
    Sector?: SortOrder
    Nombre_acudiente?: SortOrder
    Telefono_acudiente?: SortOrder
    Antecedente_Patologico1?: SortOrder
    Antecedente_Patologico2?: SortOrder
    Antecedente_Patologico3?: SortOrder
    Antecedente_Quirurgico1?: SortOrder
    Antecedente_Quirurgico2?: SortOrder
    Antecedente_Familiar1?: SortOrder
    Antecedente_Familiar2?: SortOrder
    Antecedente_Familiar3?: SortOrder
    Hemoclasificaci_n?: SortOrder
    RH?: SortOrder
    Fecha_afiliacion?: SortOrder
    Parentezco?: SortOrder
    Ciudad_cedula?: SortOrder
    Escalafon_afiliado?: SortOrder
    Discapacidad?: SortOrder
    Estrato?: SortOrder
    AL1?: SortOrder
    AL2?: SortOrder
    Cod_medico?: SortOrder
    Codigo_eps?: SortOrder
    Rango?: SortOrder
    Pagos?: SortOrder
    Cod_odontologo?: SortOrder
    Fecha_novedad?: SortOrder
    Contrato?: SortOrder
    N_mero_afiliaci_n?: SortOrder
    Etnico?: SortOrder
    NumeroSemanasCotizadas?: SortOrder
    LugarNacimiento?: SortOrder
    NroHijos?: SortOrder
    Escolaridad?: SortOrder
    FechaAfiliacion?: SortOrder
    Celular?: SortOrder
    CorreoElectr_nico?: SortOrder
    Responsable?: SortOrder
    Telefono_Responsable?: SortOrder
    Religion?: SortOrder
    Telefono_Secundario?: SortOrder
    email?: SortOrder
    Fecha_Creado?: SortOrder
    Creado_Por?: SortOrder
    Fecha_Modificado?: SortOrder
    Modificado_por?: SortOrder
    Fecha_Estado?: SortOrder
    Portabilidad?: SortOrder
    Fecha_Portabilidad?: SortOrder
    nombre_disp_asignado?: SortOrder
    Genero?: SortOrder
    Poblacion_Clave?: SortOrder
    Gestacion?: SortOrder
    Victima_del_Conflicto_armado?: SortOrder
    VICTIMA_DEL_MALTRATO?: SortOrder
    ABANDONO_SOCIAL?: SortOrder
    DESESCOLARIZADO?: SortOrder
    DESEMPLEADO?: SortOrder
    CARCELARIO?: SortOrder
    MIGRANTE?: SortOrder
    TRABAJADORA_SEXUAL?: SortOrder
    POBLACION_LGTBI?: SortOrder
    ORIENTACION_SEXUAL?: SortOrder
    Barrio?: SortOrder
    confirmacion_telefono?: SortOrder
    poll?: SortOrder
    Clave?: SortOrder
    codPaisResidencia?: SortOrder
    codMunicipioResidencia?: SortOrder
    codDepartamentoResidencia?: SortOrder
    codPaisOrigen?: SortOrder
    codZonaTerritorialResidencia?: SortOrder
    incapacidad?: SortOrder
    Capitado?: SortOrder
    IdUsuario?: SortOrder
    IdCentro?: SortOrder
    vacunas_completas?: SortOrder
    intervenciones_quirurgicas?: SortOrder
    alergia?: SortOrder
  }

  export type usuariosSumOrderByAggregateInput = {
    AL1?: SortOrder
    AL2?: SortOrder
    NumeroSemanasCotizadas?: SortOrder
    NroHijos?: SortOrder
    IdUsuario?: SortOrder
    IdCentro?: SortOrder
  }

  export type Enumusuarios_CapitadoNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.usuarios_Capitado | Enumusuarios_CapitadoFieldRefInput<$PrismaModel> | null
    in?: $Enums.usuarios_Capitado[] | null
    notIn?: $Enums.usuarios_Capitado[] | null
    not?: NestedEnumusuarios_CapitadoNullableWithAggregatesFilter<$PrismaModel> | $Enums.usuarios_Capitado | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumusuarios_CapitadoNullableFilter<$PrismaModel>
    _max?: NestedEnumusuarios_CapitadoNullableFilter<$PrismaModel>
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type BytesFilter<$PrismaModel = never> = {
    equals?: Uint8Array | BytesFieldRefInput<$PrismaModel>
    in?: Uint8Array[]
    notIn?: Uint8Array[]
    not?: NestedBytesFilter<$PrismaModel> | Uint8Array
  }

  export type BytesNullableFilter<$PrismaModel = never> = {
    equals?: Uint8Array | BytesFieldRefInput<$PrismaModel> | null
    in?: Uint8Array[] | null
    notIn?: Uint8Array[] | null
    not?: NestedBytesNullableFilter<$PrismaModel> | Uint8Array | null
  }

  export type empleadosOrderByRelevanceInput = {
    fields: empleadosOrderByRelevanceFieldEnum | empleadosOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type empleadosCountOrderByAggregateInput = {
    C_digo_empleado?: SortOrder
    Nombre_empleado?: SortOrder
    Direcci_n?: SortOrder
    Tel_fonos?: SortOrder
    Medico?: SortOrder
    EsMedico?: SortOrder
    Odontologo?: SortOrder
    Clave?: SortOrder
    Estado_Empleado?: SortOrder
    POtraEsp?: SortOrder
    Registro_medico?: SortOrder
    De?: SortOrder
    Firma?: SortOrder
    Registra?: SortOrder
    enfermeria?: SortOrder
    Perfil?: SortOrder
    Perfil2?: SortOrder
    phone?: SortOrder
    Firmaimg?: SortOrder
    consultorio?: SortOrder
    email?: SortOrder
    IdCentro?: SortOrder
    userpic?: SortOrder
    TipoDocumento?: SortOrder
    Documento?: SortOrder
  }

  export type empleadosAvgOrderByAggregateInput = {
    Perfil?: SortOrder
    Perfil2?: SortOrder
    IdCentro?: SortOrder
  }

  export type empleadosMaxOrderByAggregateInput = {
    C_digo_empleado?: SortOrder
    Nombre_empleado?: SortOrder
    Direcci_n?: SortOrder
    Tel_fonos?: SortOrder
    Medico?: SortOrder
    EsMedico?: SortOrder
    Odontologo?: SortOrder
    Clave?: SortOrder
    Estado_Empleado?: SortOrder
    POtraEsp?: SortOrder
    Registro_medico?: SortOrder
    De?: SortOrder
    Firma?: SortOrder
    Registra?: SortOrder
    enfermeria?: SortOrder
    Perfil?: SortOrder
    Perfil2?: SortOrder
    phone?: SortOrder
    Firmaimg?: SortOrder
    consultorio?: SortOrder
    email?: SortOrder
    IdCentro?: SortOrder
    userpic?: SortOrder
    TipoDocumento?: SortOrder
    Documento?: SortOrder
  }

  export type empleadosMinOrderByAggregateInput = {
    C_digo_empleado?: SortOrder
    Nombre_empleado?: SortOrder
    Direcci_n?: SortOrder
    Tel_fonos?: SortOrder
    Medico?: SortOrder
    EsMedico?: SortOrder
    Odontologo?: SortOrder
    Clave?: SortOrder
    Estado_Empleado?: SortOrder
    POtraEsp?: SortOrder
    Registro_medico?: SortOrder
    De?: SortOrder
    Firma?: SortOrder
    Registra?: SortOrder
    enfermeria?: SortOrder
    Perfil?: SortOrder
    Perfil2?: SortOrder
    phone?: SortOrder
    Firmaimg?: SortOrder
    consultorio?: SortOrder
    email?: SortOrder
    IdCentro?: SortOrder
    userpic?: SortOrder
    TipoDocumento?: SortOrder
    Documento?: SortOrder
  }

  export type empleadosSumOrderByAggregateInput = {
    Perfil?: SortOrder
    Perfil2?: SortOrder
    IdCentro?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type BytesWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Uint8Array | BytesFieldRefInput<$PrismaModel>
    in?: Uint8Array[]
    notIn?: Uint8Array[]
    not?: NestedBytesWithAggregatesFilter<$PrismaModel> | Uint8Array
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBytesFilter<$PrismaModel>
    _max?: NestedBytesFilter<$PrismaModel>
  }

  export type BytesNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Uint8Array | BytesFieldRefInput<$PrismaModel> | null
    in?: Uint8Array[] | null
    notIn?: Uint8Array[] | null
    not?: NestedBytesNullableWithAggregatesFilter<$PrismaModel> | Uint8Array | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBytesNullableFilter<$PrismaModel>
    _max?: NestedBytesNullableFilter<$PrismaModel>
  }

  export type especialidad_empleadosOrderByRelevanceInput = {
    fields: especialidad_empleadosOrderByRelevanceFieldEnum | especialidad_empleadosOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type especialidad_empleadosC_digo_empleadoC_digo_especialidadIdCentroCompoundUniqueInput = {
    C_digo_empleado: string
    C_digo_especialidad: string
    IdCentro: number
  }

  export type especialidad_empleadosCountOrderByAggregateInput = {
    Consecutivo?: SortOrder
    C_digo_empleado?: SortOrder
    C_digo_especialidad?: SortOrder
    IdCentro?: SortOrder
    Principal?: SortOrder
    Cups?: SortOrder
    regimen_atencion?: SortOrder
    MinutosXConsulta?: SortOrder
    NoPacientes?: SortOrder
    fecha_final?: SortOrder
    fecha_inicial?: SortOrder
    hf_m?: SortOrder
    hf_t?: SortOrder
    hi_m?: SortOrder
    hi_t?: SortOrder
    IdSede?: SortOrder
    bot?: SortOrder
    contrato?: SortOrder
  }

  export type especialidad_empleadosAvgOrderByAggregateInput = {
    Consecutivo?: SortOrder
    IdCentro?: SortOrder
    MinutosXConsulta?: SortOrder
    NoPacientes?: SortOrder
    IdSede?: SortOrder
  }

  export type especialidad_empleadosMaxOrderByAggregateInput = {
    Consecutivo?: SortOrder
    C_digo_empleado?: SortOrder
    C_digo_especialidad?: SortOrder
    IdCentro?: SortOrder
    Principal?: SortOrder
    Cups?: SortOrder
    regimen_atencion?: SortOrder
    MinutosXConsulta?: SortOrder
    NoPacientes?: SortOrder
    fecha_final?: SortOrder
    fecha_inicial?: SortOrder
    hf_m?: SortOrder
    hf_t?: SortOrder
    hi_m?: SortOrder
    hi_t?: SortOrder
    IdSede?: SortOrder
    bot?: SortOrder
    contrato?: SortOrder
  }

  export type especialidad_empleadosMinOrderByAggregateInput = {
    Consecutivo?: SortOrder
    C_digo_empleado?: SortOrder
    C_digo_especialidad?: SortOrder
    IdCentro?: SortOrder
    Principal?: SortOrder
    Cups?: SortOrder
    regimen_atencion?: SortOrder
    MinutosXConsulta?: SortOrder
    NoPacientes?: SortOrder
    fecha_final?: SortOrder
    fecha_inicial?: SortOrder
    hf_m?: SortOrder
    hf_t?: SortOrder
    hi_m?: SortOrder
    hi_t?: SortOrder
    IdSede?: SortOrder
    bot?: SortOrder
    contrato?: SortOrder
  }

  export type especialidad_empleadosSumOrderByAggregateInput = {
    Consecutivo?: SortOrder
    IdCentro?: SortOrder
    MinutosXConsulta?: SortOrder
    NoPacientes?: SortOrder
    IdSede?: SortOrder
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type especialidadcupsempleadoOrderByRelevanceInput = {
    fields: especialidadcupsempleadoOrderByRelevanceFieldEnum | especialidadcupsempleadoOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type especialidadcupsempleadoCodigoEmpleadoCodigoEspecialidadCupsCompoundUniqueInput = {
    CodigoEmpleado: string
    CodigoEspecialidad: string
    Cups: string
  }

  export type especialidadcupsempleadoCountOrderByAggregateInput = {
    CodigoEmpleado?: SortOrder
    CodigoEspecialidad?: SortOrder
    Cups?: SortOrder
    Porcentaje?: SortOrder
    Valor?: SortOrder
  }

  export type especialidadcupsempleadoAvgOrderByAggregateInput = {
    Porcentaje?: SortOrder
    Valor?: SortOrder
  }

  export type especialidadcupsempleadoMaxOrderByAggregateInput = {
    CodigoEmpleado?: SortOrder
    CodigoEspecialidad?: SortOrder
    Cups?: SortOrder
    Porcentaje?: SortOrder
    Valor?: SortOrder
  }

  export type especialidadcupsempleadoMinOrderByAggregateInput = {
    CodigoEmpleado?: SortOrder
    CodigoEspecialidad?: SortOrder
    Cups?: SortOrder
    Porcentaje?: SortOrder
    Valor?: SortOrder
  }

  export type especialidadcupsempleadoSumOrderByAggregateInput = {
    Porcentaje?: SortOrder
    Valor?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type tventidadesOrderByRelevanceInput = {
    fields: tventidadesOrderByRelevanceFieldEnum | tventidadesOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type tventidadesCountOrderByAggregateInput = {
    Codigo?: SortOrder
    NombreEntidad?: SortOrder
    Departamento?: SortOrder
    Municipio?: SortOrder
    Digitado?: SortOrder
    Nit?: SortOrder
    Dv?: SortOrder
    email?: SortOrder
    telefono?: SortOrder
    Direccion?: SortOrder
  }

  export type tventidadesMaxOrderByAggregateInput = {
    Codigo?: SortOrder
    NombreEntidad?: SortOrder
    Departamento?: SortOrder
    Municipio?: SortOrder
    Digitado?: SortOrder
    Nit?: SortOrder
    Dv?: SortOrder
    email?: SortOrder
    telefono?: SortOrder
    Direccion?: SortOrder
  }

  export type tventidadesMinOrderByAggregateInput = {
    Codigo?: SortOrder
    NombreEntidad?: SortOrder
    Departamento?: SortOrder
    Municipio?: SortOrder
    Digitado?: SortOrder
    Nit?: SortOrder
    Dv?: SortOrder
    email?: SortOrder
    telefono?: SortOrder
    Direccion?: SortOrder
  }

  export type tvespecialidadesOrderByRelevanceInput = {
    fields: tvespecialidadesOrderByRelevanceFieldEnum | tvespecialidadesOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type tvespecialidadesCountOrderByAggregateInput = {
    CodigoEspecialidad?: SortOrder
    Especialidad?: SortOrder
    CUPS?: SortOrder
    CodigoServicio?: SortOrder
  }

  export type tvespecialidadesAvgOrderByAggregateInput = {
    CodigoServicio?: SortOrder
  }

  export type tvespecialidadesMaxOrderByAggregateInput = {
    CodigoEspecialidad?: SortOrder
    Especialidad?: SortOrder
    CUPS?: SortOrder
    CodigoServicio?: SortOrder
  }

  export type tvespecialidadesMinOrderByAggregateInput = {
    CodigoEspecialidad?: SortOrder
    Especialidad?: SortOrder
    CUPS?: SortOrder
    CodigoServicio?: SortOrder
  }

  export type tvespecialidadesSumOrderByAggregateInput = {
    CodigoServicio?: SortOrder
  }

  export type tbldetalleremisionOrderByRelevanceInput = {
    fields: tbldetalleremisionOrderByRelevanceFieldEnum | tbldetalleremisionOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type tbldetalleremisionCountOrderByAggregateInput = {
    Id?: SortOrder
    IdOrden?: SortOrder
    CodItem?: SortOrder
    Descripcion?: SortOrder
    CodServicio?: SortOrder
    Ejecutada?: SortOrder
    Fecha_Ejecutada?: SortOrder
    Hora_Ejecutada?: SortOrder
    Ejecutada_por?: SortOrder
    Observaciones?: SortOrder
    Mostrar?: SortOrder
    IdMedicoOrdena?: SortOrder
  }

  export type tbldetalleremisionAvgOrderByAggregateInput = {
    Id?: SortOrder
    IdOrden?: SortOrder
    CodItem?: SortOrder
    CodServicio?: SortOrder
    Ejecutada?: SortOrder
    Mostrar?: SortOrder
  }

  export type tbldetalleremisionMaxOrderByAggregateInput = {
    Id?: SortOrder
    IdOrden?: SortOrder
    CodItem?: SortOrder
    Descripcion?: SortOrder
    CodServicio?: SortOrder
    Ejecutada?: SortOrder
    Fecha_Ejecutada?: SortOrder
    Hora_Ejecutada?: SortOrder
    Ejecutada_por?: SortOrder
    Observaciones?: SortOrder
    Mostrar?: SortOrder
    IdMedicoOrdena?: SortOrder
  }

  export type tbldetalleremisionMinOrderByAggregateInput = {
    Id?: SortOrder
    IdOrden?: SortOrder
    CodItem?: SortOrder
    Descripcion?: SortOrder
    CodServicio?: SortOrder
    Ejecutada?: SortOrder
    Fecha_Ejecutada?: SortOrder
    Hora_Ejecutada?: SortOrder
    Ejecutada_por?: SortOrder
    Observaciones?: SortOrder
    Mostrar?: SortOrder
    IdMedicoOrdena?: SortOrder
  }

  export type tbldetalleremisionSumOrderByAggregateInput = {
    Id?: SortOrder
    IdOrden?: SortOrder
    CodItem?: SortOrder
    CodServicio?: SortOrder
    Ejecutada?: SortOrder
    Mostrar?: SortOrder
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableEnumusuarios_CapitadoFieldUpdateOperationsInput = {
    set?: $Enums.usuarios_Capitado | null
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type BytesFieldUpdateOperationsInput = {
    set?: Uint8Array
  }

  export type NullableBytesFieldUpdateOperationsInput = {
    set?: Uint8Array | null
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumusuarios_CapitadoNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.usuarios_Capitado | Enumusuarios_CapitadoFieldRefInput<$PrismaModel> | null
    in?: $Enums.usuarios_Capitado[] | null
    notIn?: $Enums.usuarios_Capitado[] | null
    not?: NestedEnumusuarios_CapitadoNullableFilter<$PrismaModel> | $Enums.usuarios_Capitado | null
  }

  export type NestedEnumusuarios_CapitadoNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.usuarios_Capitado | Enumusuarios_CapitadoFieldRefInput<$PrismaModel> | null
    in?: $Enums.usuarios_Capitado[] | null
    notIn?: $Enums.usuarios_Capitado[] | null
    not?: NestedEnumusuarios_CapitadoNullableWithAggregatesFilter<$PrismaModel> | $Enums.usuarios_Capitado | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumusuarios_CapitadoNullableFilter<$PrismaModel>
    _max?: NestedEnumusuarios_CapitadoNullableFilter<$PrismaModel>
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBytesFilter<$PrismaModel = never> = {
    equals?: Uint8Array | BytesFieldRefInput<$PrismaModel>
    in?: Uint8Array[]
    notIn?: Uint8Array[]
    not?: NestedBytesFilter<$PrismaModel> | Uint8Array
  }

  export type NestedBytesNullableFilter<$PrismaModel = never> = {
    equals?: Uint8Array | BytesFieldRefInput<$PrismaModel> | null
    in?: Uint8Array[] | null
    notIn?: Uint8Array[] | null
    not?: NestedBytesNullableFilter<$PrismaModel> | Uint8Array | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedBytesWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Uint8Array | BytesFieldRefInput<$PrismaModel>
    in?: Uint8Array[]
    notIn?: Uint8Array[]
    not?: NestedBytesWithAggregatesFilter<$PrismaModel> | Uint8Array
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBytesFilter<$PrismaModel>
    _max?: NestedBytesFilter<$PrismaModel>
  }

  export type NestedBytesNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Uint8Array | BytesFieldRefInput<$PrismaModel> | null
    in?: Uint8Array[] | null
    notIn?: Uint8Array[] | null
    not?: NestedBytesNullableWithAggregatesFilter<$PrismaModel> | Uint8Array | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBytesNullableFilter<$PrismaModel>
    _max?: NestedBytesNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
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