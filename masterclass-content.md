# Toggle Heading 3: titulo de la clase: Handle Quantity & Multiple Products

## 1. Práctica de Recuperación (Active Recall)

1. ¿Por qué es crítico validar el stock existente en el carrito (`existItem.qty`) y no solo el stock disponible del producto antes de incrementar la cantidad?
2. ¿Qué ventaja arquitectónica ofrece retornar `undefined` en `getMyCart` en lugar de lanzar una excepción cuando no existe la cookie de sesión?
3. ¿Cuál es el riesgo de no mantener las migraciones de Prisma sincronizadas con el schema cuando mutas el modelo del carrito en producción?

## 2. Anclaje y Explicación Granular (Paso a Paso)

### Módulo A: Resiliencia de Sesión y Auto-Creación del Carrito

```typescript
// lib/actions/cart.actions.ts
let sessionCartId = (await cookies()).get("sessionCartId")?.value;
if (!sessionCartId) {
  sessionCartId = crypto.randomUUID();
  (await cookies()).set("sessionCartId", sessionCartId);
}
```

**Disección Técnica:**
El cambio de `const` a `let` y la auto-generación del `sessionCartId` eliminan un punto de fallo frecuente: el usuario que llega al sitio sin cookie de carrito y clickea "Add to Cart" directamente desde un deep link o tras una expiración de sesión. Anteriormente, el sistema lanzaba un error (`Cart session id not found`), rompiendo el flujo de compra. Ahora, aplicamos una estrategia de **resiliencia pasiva**: si el estado esperado no existe, lo inicializamos idempotentemente con `crypto.randomUUID()`. Críticamente, `randomUUID()` es criptográficamente seguro, evitando colisiones en escenarios de alta concurrencia. El único cuello de botella es la latencia adicional de setear la cookie, pero es insignificante comparado con la mejora en UX.

### Módulo B: Lógica de Cantidad y Múltiples Productos

```typescript
// lib/actions/cart.actions.ts
const existItem = (cart.items as CartItem[]).find((x)=>x.productId === item.productId)

if(existItem){
  if(product.stock < existItem.qty + 1){
    throw new Error('Not enough stock')
  }
  (cart.items as CartItem[]).find((x)=>x.productId === item.productId)!.qty = existItem.qty + 1
} else {
  if(product.stock < 1) throw new Error('Not enough stock')
  cart.items.push(item)
}

await prisma.cart.update({
  where:{id:cart.id},
  data:{
    items: cart.items as Prisma.CartUpdateitemsInput[],
    ...calcPrice(cart.items as CartItem[])
  }
})
```

**Disección Técnica:**
Aquí se introduce el núcleo del manejo de múltiples productos. El código hace dos cosas esenciales:

1. **Coherencia de Stock (Race Condition Prevention):** La validación `product.stock < existItem.qty + 1` es crucial. No basta con verificar si el stock es mayor a cero; debes considerar la cantidad **acumulada** que ya tiene el usuario en su carrito. Sin esto, podrías permitir un "overselling" parcial donde un usuario agrega 1 unidad, luego otra, superando el límite real.

2. **Mutación In-Place vs Inmutabilidad:** El código muta directamente el array `cart.items` (mediante `find` y reasignación de `qty`, o `push`). Esto es intencional en un entorno Server Action de Next.js donde `cart` es un objeto deserializado de Prisma. Sin embargo, desde una perspectiva de arquitectura a gran escala, mutar objetos deserializados puede introducir bugs si se comparten referencias entre requests. En sistemas distribuidos (ej. usando Redis para el carrito), preferirías una operación atómica como `HINCRBY` o una transacción `MULTI/EXEC`.

3. **Cálculo de Precios Lateral:** El spread de `calcPrice` es elegante, pero concatena la lógica de negocio con la persistencia. Si `calcPrice` crece en complejidad (impuestos, descuentos dinámicos), este acoplamiento directo puede volverse un problema de mantenimiento. Considera extraer un servicio `CartService.upsertItem()` para reducir la complejidad ciclomática de la action.

### Módulo C: Feedback Dinámico en el Cliente

```typescript
// components/product/add-to-cart.tsx
toast.success(res.message, {
    action: (
        <Button className='bg-primary text-white cursor-pointer hover:bg-gray-800 ' onClick={() => router.push('/cart')}>
            Go to Cart
        </Button>
    ),
})
```

**Disección Técnica:**
Cambiar el mensaje hardcodeado `${item.name} added to cart!` por `res.message` delega la responsabilidad del copy al servidor. Esto no es solo estético: permite que el servidor decida si el producto fue "added" o "updated in" el carrito, proporcionando feedback semánticamente correcto. Desde el punto de vista de renders, no hay impacto negativo porque el toast se ejecuta fuera del ciclo de renderizado de React (vía `sonner`).

### Módulo D: Graceful Degradation en Lectura de Carrito

```typescript
// lib/actions/cart.actions.ts
export const getMyCart = async () => {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) return undefined;
  // ... resto de la lógica
}
```

**Disección Técnica:**
Retornar `undefined` en lugar de lanzar un error es una corrección arquitectónica sólida. En una Server Component o RSC, lanzar una excepción aquí rompería la página entera o requeriría un `try/catch` en cada consumidor. Retornar `undefined` permite al componente decidir cómo renderizar un estado vacío (ej. "Your cart is empty"). Es un ejemplo clásico del principio **Fail-Safe**: el sistema tolera la ausencia de estado en lugar de exigirlo.

### Módulo E: Importancia de las Migraciones de Base de Datos

**Concepto Crítico:**
En este flujo, `prisma.cart.update` persiste un array JSON (`items`) y campos derivados (`itemsPrice`, `totalPrice`, `shippingPrice`, `taxPrice`) en una tabla `Cart`. Si en una iteración futura decides normalizar este schema (por ejemplo, extrayendo `CartItem` a su propia tabla para consultas SQL más eficientes o restricciones de integridad referencial), **cualquier modificación al schema de Prisma debe ir acompañada de una migración aplicada**.

- **`npx prisma migrate dev` vs `npx prisma migrate deploy`:** En desarrollo, `migrate dev` genera y aplica migraciones. En producción, DEBES usar `migrate deploy` para aplicar migraciones pendientes de forma segura. Si despliegas código nuevo (con `prisma.cart.update` apuntando a columnas nuevas) sin haber aplicado la migración, obtendrás errores 500 en runtime porque la base de datos no reconoce el schema que el código espera.
- **Invariante del Schema:** Mantén un pipeline CI/CD que ejecute `prisma migrate deploy` *antes* de levantar la nueva versión de la aplicación. Esto asegura que el schema siempre esté adelante o alineado con el código.
- **Rollback:** Si una migración falla, tu sistema debe poder hacer rollback del despliegue sin perder consistencia. Las migraciones de Prisma son transaccionales (donde la base de datos lo permita), pero siempre revisa los archivos generados en `prisma/migrations/` antes de commitearlos.

## 3. Elaboración y Visión Arquitectónica Avanzada

**Escenarios a Escala:**

- **Concurrencia de Inventario (TechFlow):** Imagina que 10 usuarios tienen el último producto en su carrito simultáneamente. La validación de stock en el array JSON del carrito es suficiente para un MVP, pero a escala requiere **bloqueo pesimista** (`SELECT FOR UPDATE`) o un sistema de reservas de inventario (soft-reserve) con TTL. El patrón actual es "optimista": confiamos en la validación previa al checkout. Un atacante o un bot podría explotar esto para agotar stock ficticiamente.
- **Normalización vs Desnormalización:** El carrito actual almacena `items` como JSON (`Prisma.JsonValue`). Esto es flexible pero impide consultas SQL directas como "¿Cuántos usuarios tienen el Producto X en su carrito?". A escala, normalizar a una tabla `CartItem` con claves foráneas mejora la observabilidad y permite triggers de base de datos para sincronizar stock automáticamente.
- **Integraciones de Pagos (Stripe/PayPal):** Al calcular precios en el servidor (`calcPrice`) antes de guardar en la BD, creas una fuente de verdad para el checkout. Esto previene ataques de manipulación de precios en el cliente. Cuando integres Stripe, este `calcPrice` debería alimentar la creación de `PaymentIntent` con `amount` calculado idénticamente en el backend.
- **Cache y Revalidación:** `revalidatePath` invalida la caché de Next.js para la página del producto. En un marketplace de alto tráfico, considera usar `revalidateTag` con tags granulares (ej. `cart-${userId}`) para evitar invalidar páginas enteras innecesariamente.

## 4. Sistema de Repetición Espaciada (Spaced Repetition)

| Fecha | Objetivo |
|-------|----------|
| **R1 (Consolidación):** 04/06/2026 | Recuperar conceptos: Explica en voz alta por qué `getMyCart` retorna `undefined` y no lanza error. Escribe pseudo-código para la validación de stock con existencia previa. |
| **R2 (Expansión):** 12/06/2026 | Aplicar a nuevos módulos: Implementa una función `removeItemFromCart` que decremente la cantidad y elimine el item si llega a cero. Añade `revalidateTag` en lugar de `revalidatePath`. |
| **R3 (Maestría):** 02/07/2026 | Optimización: Refactoriza el carrito para que use una tabla `CartItem` normalizada en Prisma. Diseña el flujo de migración necesario para pasar del JSON al schema relacional sin downtime. |
