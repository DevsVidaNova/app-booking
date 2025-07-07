
//BOOKING
export type CreateBooking = {
    description: string,
    room: string,
    date?: string | undefined | null | Date,
    start_time: string,
    end_time: string,
    repeat?: string | undefined | null,
    day_repeat?: number | string | undefined | null,
}

export type EditBooking = {
    description: string,
    room_id: number,
    date?: string | undefined | null | Date,
    start_time: string,
    end_time: string,
    repeat?: string | undefined | null,
    day_repeat?: number | string | undefined | null,
}

export type ListBooking = {
    id: number,
    description: string,
    room: {
        id: string,
        name: string,
        size: string,
    },
    date: string | null,
    day_of_week: string,
	month:string,
    start_time: string,
    end_time: string,
    user: {
        id: string,
        name: string,
        email: string,
        phone: string | null
    },
    repeat: string | null,
    repeat_day:  null | string | undefined,
}

//ROOM
export interface Room {
    id: string, //id da sala
    name: string, //nome da sala
    size: string, //quantidade de pessoas
    description: string, //ex: sala de reunião
    exclusive: boolean, //exclusivo ou não
    status: boolean,  //ativo ou não
    created_at: string, //data de criação
}

export interface ListRoom {
    data: Room[], 
    total: number, //nome da sala
    page: number, //quantidade de pessoas
    to: number, //quantidade de pessoas
    totalPages: number, //ex: sala de reunião
    hasNext: boolean, //exclusivo ou não
    hasPrev: boolean,  //ativo ou não
}
export interface CreateRoom {
    name: string, //nome da sala
    size: number, //quantidade de pessoas
    description: string, //ex: sala de reunião
    exclusive: boolean, //exclusivo ou não
    status: boolean,  //ativo ou não
}

//MEMBER
export interface ListMember {
    total: number,
    page: number,
    to: number,  
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean, 
    data: SingleMember[]
}
export interface Pagination{
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
}

export interface SingleMember {
        id: string;
        full_name: string;
        birth_date: string;
        gender: 'Masculino' | 'Feminino' | 'Outro';
        cpf: string;
        rg: string;
        phone: string;
        email: string;
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
        cep: string;
        mother_name: string;
        father_name: string;
        marital_status: 'Casado' | 'Solteiro' | 'Divorciado' | 'Viúvo';
        has_children: boolean;
        children_count: number;
    }

export interface CreateMember {
    full_name: string;
    birth_date: string;
    gender: 'Masculino' | 'Feminino' | 'Outro';
    cpf: string;
    rg: string;
    phone: string;
    email: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    mother_name: string;
    father_name: string;
    marital_status: 'Casado' | 'Solteiro' | 'Divorciado' | 'Viúvo';
    has_children: boolean;
    children_count: number;
    /*   available_days: string[]; // Ex: ["Segunda", "Quarta", "Sexta"]
       available_hours: string[]; // Ex: ["18:00-20:00", "14:00-16:00"]
       interests: string[];
       skills: string[];
       health_restrictions: string;
       previous_volunteering: boolean;
       previous_volunteering_place: string | undefined | null;
       */
}


//SCALE
export interface ListScale {
    id: string,
    name: string,
    date: string,
    direction: {
        name: string
    },
    confirmations: number
}
export interface Person {
    id: string;
    full_name: string;
    phone: string | null;
    email: string;
}
interface ScaleConfirmation {
    user_id: string;
    confirmed: boolean;
}
export interface SingleScale {
    id: string;
    name: string;
    date: string;
    description: string;
    band: Person | null;
    projection: Person | Person[] | null;
    light: Person | Person[] | null;
    transmission: Person | Person[] | null;
    camera: Person | Person[] | null;
    live: Person | Person[] | null;
    sound: Person | Person[] | null;
    training_sound: Person | Person[] | null;
    photography: Person | Person[] | null;
    stories: Person | null;
    dynamic: Person | null;
    direction: Person | null;
    scale_confirmations: ScaleConfirmation[];
    percentage_confirmed: string;
}
export interface CreateScale {
    name: string,
    date: string,
    direction: string | null | undefined,
    band?: string | null | undefined,
    projection?: string | null | undefined,
    sound?: string | null | undefined,
    light?: string | null | undefined,
    transmission?: string | null | undefined,
    camera?: string | null | undefined,
    live?: string | null | undefined,
    training_sound?: string | null | undefined,
    photography?: string | null | undefined,
    stories?: string | null | undefined,
    dynamic?: string | null | undefined,
}
export interface ConfirmScale {
    scale_id: string,
    confirmed: boolean
}



export type LoginUser = {
    message: string;
    user: {
        email: string;
        id: string;
        isAdmin: boolean;
    };
    token: string;
}
export type Analytics = {
    rooms: number, //quantidade de salas
    bookings: number, //quantidade de reservas
    users: number, //quantidade de usuários
    week: number, //quantidade de reservas para a semana
    members: number
}

//USER TYPES

export type ListUser = {
    total: number,
    page: number,
    to: number,  
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean, 
    data: User[]
};

export type User = {
    id: string;
    name: string;
    role: string;
    user_id: string;
    phone: string;
    email: string;
    total_bookings?: number;
};

export type EditUser = {
    phone: string;
    name: string;
};

export type CreateUser = {
    name: string;
    phone: string;
    email: string;
    password: string;
    role?: string;
};

//TIMELINE
export type Timeline = {
    id: string;
    title: string; //CULTO DE DOMINGO
    description: string; //COM A PRESENÇA DO PASTOR FULANO
    date: string; //24/12/2025
    startTime: string, //19:00
    endTime: string, //21:00
    room: string, //TEMPLO
    status: string, //finished, progress, unstarted
    sections: [
        {
            title: string, //ANTES DO CULTO
            description: string, //ENSAIO DA BANDA
            startTime: string, //18:00
            endTime: string, //19:00
            presentation: string, //DRIVE GOOGLE LINK
            playlist: [
                {
                    title: string, //NADA MAIS - FHOP (ENSAIO)
                    description: string, //FULANO DE TAL, FULANO DE TAL E CICLANO
                    url: string, //https://www.youtube.com/watch?v=N5AMmLZjaaM
                },
                {
                    title: string, //OS QUE OLHAM PARA TI - FHOP (ENSAIO)
                    description: string, //FULANO DE TAL, FULANO DE TAL E CICLANO
                    url: string, //https://www.youtube.com/watch?v=Dv-7mBQNEIo
                },
            ]
        },
        {
            title: string, //PRELÚDIO
            description: string, //LOUVOR COM A BANDA
            startTime: string, //19:00
            endTime: string, //19:20
            presentation: string, //DRIVE GOOGLE LINK
            playlist: [
                {
                    title: string, //NADA MAIS - FHOP
                    description: string, //FULANO DE TAL, FULANO DE TAL E CICLANO
                    url: string, //https://www.youtube.com/watch?v=N5AMmLZjaaM
                },
                {
                    title: string, //OS QUE OLHAM PARA TI - FHOP
                    description: string, //FULANO DE TAL, FULANO DE TAL E CICLANO
                    url: string, //https://www.youtube.com/watch?v=Dv-7mBQNEIo
                },
            ]
        },
        {
            title: string, //CULTO
            description: string, //PREGAÇÃO DO PASTOR FULANO
            startTime: string, //19:20
            endTime: string, //20:45
            presentation: string, //DRIVE GOOGLE LINK
        },
        {
            title: string, //PÓSLÚDIO
            description: string, //AVISOS E DESPEDIDA
            startTime: string, //20:45
            endTime: string, //21:00
            presentation: string, //DRIVE GOOGLE LINK
            playlist: [
                {
                    title: string, //NADA MAIS - FHOP (AO VIVO)
                    description: string, //FULANO DE TAL, FULANO DE TAL E CICLANO
                    url: string, //https://www.youtube.com/watch?v=N5AMmLZjaaM
                },
                {
                    title: string, //OS QUE OLHAM PARA TI -
                    description: string, //FULANO DE TAL, FULANO DE TAL E CICLANO
                    url: string, //https://www.youtube.com/watch?v=Dv-7mBQNEIo
                },
            ]
        }
    ]
}



//CALENDAR
export type CalendarEvent = {
  event: {
    allDay: boolean;
    title: string;
    start: string; // ISO 8601
    end: string;   // ISO 8601
    id: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    extendedProps: {
      booking: {
        id: number;
        description: string;
        room: {
          id: string;
          name: string;
          size: number;
        };
        date: string | null;
        day_of_week: string;
        month: string | null;
        start_time: string;
        end_time: string;
        repeat: string;
        repeat_day: string;
        user: {
          id: string;
          name: string;
          email: string;
          phone: string;
        };
      };
    };
  };
  view: {
    type: string;
    dateEnv: {
      timeZone: string;
      canComputeOffset: boolean;
      calendarSystem: Record<string, unknown>;
      locale: {
        codeArg: string;
        codes: string[];
        week: {
          dow: number;
          doy: number;
        };
        simpleNumberFormat: Record<string, unknown>;
        options: {
          buttonText: Record<string, string>;
          buttonHints: Record<string, string>;
          weekText: string;
          weekTextLong: string;
          allDayText: string;
          noEventsText: string;
          navLinkHint: string;
          closeHint: string;
          timeHint: string;
          eventHint: string;
          direction: string;
        };
      };
      weekDow: number;
      weekDoy: number;
      weekText: string;
      weekTextLong: string;
      cmdFormatter: unknown;
      defaultSeparator: string;
    };
  };
  timeText: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  isDraggable: boolean;
  isStartResizable: boolean;
  isEndResizable: boolean;
  isMirror: boolean;
  isStart: boolean;
  isEnd: boolean;
  isPast: boolean;
  isFuture: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
};

export type CalendarDateClickArg = {
  date: string | Date;
  dateStr: string;
  allDay: boolean;
  dayEl: HTMLElement;
  jsEvent: {
    isTrusted: boolean;
    [key: string]: any;
  };
  view: {
    type: string;
    dateEnv: {
      timeZone: string;
      canComputeOffset: boolean;
      calendarSystem: Record<string, any>;
      locale: {
        codeArg: string;
        codes: string[];
        week: {
          dow: number;
          doy: number;
        };
        simpleNumberFormat: Record<string, any>;
        options: {
          buttonText: Record<string, string>;
          buttonHints: Record<string, string>;
          weekText: string;
          weekTextLong: string;
          allDayText: string;
          noEventsText: string;
          navLinkHint: string;
          closeHint: string;
          timeHint: string;
          eventHint: string;
          direction: string;
        };
      };
      weekDow: number;
      weekDoy: number;
      weekText: string;
      weekTextLong: string;
      cmdFormatter: any;
      defaultSeparator: string;
    };
  };
};
