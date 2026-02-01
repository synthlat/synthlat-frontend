// Client-safe constants and helpers for Tickets module

export const DEFAULT_PANEL = {
  name: "Nuevo Panel",
  channelId: null,
  supportRoles: [], // Global roles that can see all tickets in this panel
  panelMessage: {
    content: "",
    embeds: [{
      title: "Crear Ticket",
      description: "Selecciona una categoría abajo para abrir un ticket.",
      color: "#a855f7"
    }]
  },
  categories: [
    { 
      id: "default",
      label: "Soporte General", 
      value: "support", 
      description: "Ayuda general con el servidor", 
      emoji: "🎫",
      categoryId: null, // Discord Category ID where tickets will be created
      ticketMessage: {
        content: "¡Hola {user}! Un miembro del staff te atenderá pronto.",
        embeds: []
      },
      supportRoles: [] // Specific roles for this category
    }
  ],
  namingScheme: "ticket-{number}", 
};
