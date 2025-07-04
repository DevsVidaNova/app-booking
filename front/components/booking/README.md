# Componentes de Booking 📅

Este diretório contém todos os componentes relacionados ao sistema de reservas (bookings) do projeto CBVN.

## Estrutura dos Componentes

### Componentes Base

#### `BookingFormBase`
Componente base reutilizável para formulários de booking. Contém toda a lógica de validação e campos necessários.

```tsx
import { BookingFormBase } from '@/components/booking'

<BookingFormBase
  onSubmit={handleSubmit}
  defaultValues={booking}
  isLoading={isSubmitting}
/>
```

#### `BookingCard` e `BookingCardList`
Componentes para exibir informações de booking de forma visual e organizada.

```tsx
import { BookingCard, BookingCardList } from '@/components/booking'

// Card individual
<BookingCard
  booking={booking}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// Lista de cards
<BookingCardList
  bookings={bookings}
  onEdit={handleEdit}
  onDelete={handleDelete}
  compact={false}
/>
```

### Componentes de Formulário

#### `BookingAdd` e `BookingEdit`
Componentes de página completa para adicionar e editar reservas.

```tsx
import { BookingAdd, BookingEdit } from '@/components/booking'

// Página de adicionar
<BookingAdd />

// Página de editar
<BookingEdit bookingId="123" />
```

#### `BookingAddPopup` e `BookingEditPopup`
Versions em modal dos formulários de booking.

```tsx
import { BookingAddPopup, BookingEditPopup } from '@/components/booking'

<BookingAddPopup
  isOpen={isOpen}
  onClose={handleClose}
  refetch={refetchBookings}
/>

<BookingEditPopup
  isOpen={isOpen}
  onClose={handleClose}
  booking={selectedBooking}
  refetch={refetchBookings}
/>
```

### Componentes de Interface

#### `BookingList`
Componente para listar reservas com funcionalidades de busca e filtro.

```tsx
import { BookingList } from '@/components/booking'

<BookingList
  filters={filters}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

#### `BookingFilters`
Componente de filtros reutilizável para busca de reservas.

```tsx
import { BookingFilters } from '@/components/booking'

<BookingFilters className="mb-6" />
```

#### `BookingDashboard`
Componente completo de dashboard que integra todos os outros componentes.

```tsx
import { BookingDashboard } from '@/components/booking'

<BookingDashboard
  title="Gerenciar Reservas"
  showFilters={true}
  defaultView="grid"
/>
```

## Hooks Personalizados

### `useBookingState`
Hook para gerenciar estados dos modais e seleções de booking.

```tsx
import { useBookingState } from '@/components/booking'

const {
  isAddModalOpen,
  isEditModalOpen,
  selectedBooking,
  openAddModal,
  closeAddModal,
  openEditModal,
  closeEditModal,
} = useBookingState()
```

### `useBookingFilters`
Hook para gerenciar filtros de busca de reservas.

```tsx
import { useBookingFilters } from '@/components/booking'

const {
  filters,
  updateFilters,
  clearFilters,
  hasActiveFilters,
} = useBookingFilters()
```

## Tipos

### `BookingFormData`
Tipo para dados do formulário de booking.

```tsx
import type { BookingFormData } from '@/components/booking'

const formData: BookingFormData = {
  description: 'Reunião de equipe',
  room_id: '1',
  date: '2024-01-15',
  start_time: '09:00',
  end_time: '10:00',
  repeat: 'none'
}
```

## Exemplo de Uso Completo

```tsx
import React from 'react'
import { BookingDashboard } from '@/components/booking'

export default function BookingsPage() {
  return (
    <div className="container mx-auto py-6">
      <BookingDashboard
        title="Sistema de Reservas"
        showFilters={true}
        defaultView="grid"
        className="max-w-7xl mx-auto"
      />
    </div>
  )
}
```

## Funcionalidades

### ✅ Implementadas
- ✅ Formulários de criação e edição
- ✅ Validação com Zod
- ✅ Integração com React Query
- ✅ Modais reutilizáveis
- ✅ Filtros avançados
- ✅ Cards visuais
- ✅ Dashboard completo
- ✅ Estados centralizados
- ✅ Hooks personalizados
- ✅ TypeScript completo
- ✅ Responsividade

### 🔄 Melhorias Futuras
- [ ] Drag & drop para reorganizar
- [ ] Visualização em calendário
- [ ] Exportação de dados
- [ ] Notificações em tempo real
- [ ] Integração com calendários externos
- [ ] Reservas recorrentes avançadas

## Dependências

- `@tanstack/react-query` - Gerenciamento de estado servidor
- `react-hook-form` - Gerenciamento de formulários
- `zod` - Validação de esquemas
- `date-fns` - Manipulação de datas
- `lucide-react` - Ícones
- `@/components/ui` - Sistema de design interno

## Estrutura de Arquivos

```
components/booking/
├── booking-add.tsx           # Página de adicionar
├── booking-add-popup.tsx     # Modal de adicionar
├── booking-card.tsx          # Cards de exibição
├── booking-dashboard.tsx     # Dashboard completo
├── booking-edit.tsx          # Página de editar
├── booking-edit-popup.tsx    # Modal de editar
├── booking-filters.tsx       # Componente de filtros
├── booking-form-base.tsx     # Formulário base
├── booking-list.tsx          # Lista de reservas
├── index.ts                  # Barrel exports
└── README.md                 # Esta documentação
```

---

**Desenvolvido com ❤️ para o projeto CBVN**