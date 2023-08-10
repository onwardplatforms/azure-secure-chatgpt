export type Message = {
  sender: 'User' | 'Model';
  content: string;
  timestamp: string;
};

export type Preview = {
  id: number;
  name: string;
  messages: Message[];
};

export const previews: Preview[] = [
  {
    id: 0,
    name: 'Tell me about horses',
    messages: [
      { sender: 'User', content: 'Hello!', timestamp: '12:00 PM' },
      { sender: 'Model', content: 'Hi there!', timestamp: '12:01 PM' },
      {
        sender: 'User',
        content: 'Tell me about horses',
        timestamp: '12:02 PM',
      },
      {
        sender: 'Model',
        content: 'Horses are mammals known for their speed and strength.',
        timestamp: '12:03 PM',
      },
      {
        sender: 'User',
        content: 'Whats the strongest type of horse?',
        timestamp: '12:02 PM',
      },
      {
        sender: 'Model',
        content: `As of my last update in September 2021, the title of the "strongest horse" is not attributed to any specific breed but rather to individual horses that have showcased exceptional strength and capabilities. Horses, like other animals, vary widely in terms of their strength and abilities, depending on factors such as their breed, training, and physical condition.

Some breeds known for their strength include:

Belgian Draft Horse: Known for their massive size and strength, they are often used for heavy pulling and agricultural work.
Clydesdale: Another large draft horse breed, famous for its striking appearance and strength.
Percheron: A powerful draft horse breed often used in pulling competitions and farm work.
Shire: One of the largest horse breeds, with exceptional strength and pulling capabilities.
Keep in mind that the "strongest horse" may vary depending on the specific task or competition being considered. Horses can excel in different areas, such as pulling heavy loads, carrying weight over long distances, or performing athletic feats.

If there have been any developments or new records since my last update, I wouldn't be aware of them. To find the most current information, I recommend checking reliable sources or recent records in the horse industry and related competitions.`,
        timestamp: '12:03 PM',
      },
      // ... up to 12 messages
    ],
  },
  {
    id: 1,
    name: 'What are quantum computers?',
    messages: [
      {
        sender: 'User',
        content: 'Explain quantum computers.',
        timestamp: '10:15 AM',
      },
      {
        sender: 'Model',
        content: 'Quantum computers use qubits instead of bits.',
        timestamp: '10:16 AM',
      },
      { sender: 'User', content: 'How does that work?', timestamp: '10:17 AM' },
      {
        sender: 'Model',
        content:
          'Qubits can represent 0, 1, or both simultaneously, allowing complex computations.',
        timestamp: '10:18 AM',
      },
      // ... up to 12 messages
    ],
  },
  {
    id: 2,
    name: 'How does photosynthesis work?',
    messages: [
      {
        sender: 'User',
        content: 'How does photosynthesis work?',
        timestamp: '08:00 AM',
      },
      {
        sender: 'Model',
        content:
          'It is a process by which plants convert sunlight into energy.',
        timestamp: '08:01 AM',
      },
      {
        sender: 'User',
        content: 'What else can you tell me?',
        timestamp: '08:02 AM',
      },
      {
        sender: 'Model',
        content:
          'The process involves several stages including the absorption of light by chlorophyll.',
        timestamp: '08:03 AM',
      },
      // ... up to 12 messages
    ],
  },
  {
    id: 3,
    name: 'Is Pluto a planet?',
    messages: [
      {
        sender: 'User',
        content: 'Is Pluto considered a planet?',
        timestamp: '09:20 AM',
      },
      {
        sender: 'Model',
        content: 'Pluto is considered a dwarf planet.',
        timestamp: '09:21 AM',
      },
    ],
  },
  {
    id: 4,
    name: 'History of the Eiffel Tower',
    messages: [
      {
        sender: 'User',
        content: 'Tell me about the Eiffel Tower.',
        timestamp: '02:30 PM',
      },
      {
        sender: 'Model',
        content: 'The Eiffel Tower was constructed in 1889.',
        timestamp: '02:31 PM',
      },
    ],
  },
  {
    id: 5,
    name: 'Difference between alligators and crocodiles',
    messages: [
      {
        sender: 'User',
        content: 'What are the differences between alligators and crocodiles?',
        timestamp: '01:45 PM',
      },
      {
        sender: 'Model',
        content: 'Alligators have wider snouts.',
        timestamp: '01:46 PM',
      },
      {
        sender: 'Model',
        content: 'Crocodiles are generally more aggressive.',
        timestamp: '01:47 PM',
      },
    ],
  },
  {
    id: 6,
    name: 'Explain black holes',
    messages: [
      {
        sender: 'User',
        content: 'Can you tell me about black holes?',
        timestamp: '11:05 AM',
      },
      {
        sender: 'Model',
        content:
          "Black holes are regions of spacetime where gravity pulls so much that even light can't escape.",
        timestamp: '11:06 AM',
      },
      { sender: 'User', content: 'Wow, fascinating!', timestamp: '11:07 AM' },
    ],
  },
  {
    id: 7,
    name: "Discuss Shakespeare's works",
    messages: [],
  },
  {
    id: 8,
    name: 'What is the function of the heart?',
    messages: [
      {
        sender: 'User',
        content: 'What does the heart do?',
        timestamp: '08:00 AM',
      },
    ],
  },
  {
    id: 9,
    name: 'How to cook spaghetti?',
    messages: [
      {
        sender: 'User',
        content: 'What is the recipe for spaghetti?',
        timestamp: '05:30 PM',
      },
      {
        sender: 'Model',
        content:
          'To cook spaghetti, you need to boil pasta and prepare a sauce.',
        timestamp: '05:31 PM',
      },
    ],
  },
  {
    id: 6,
    name: 'The benefits of regular exercise',
    messages: [
      {
        sender: 'User',
        content: 'Can you tell me about the benefits of regular exercise?',
        timestamp: '09:30 AM',
      },
      {
        sender: 'Model',
        content: 'Regular exercise can improve cardiovascular health.',
        timestamp: '09:31 AM',
      },
      {
        sender: 'Model',
        content: 'Exercise helps in maintaining a healthy weight.',
        timestamp: '09:32 AM',
      },
    ],
  },
  {
    id: 7,
    name: 'Exploring the wonders of the universe',
    messages: [
      {
        sender: 'User',
        content: 'What are some of the wonders of the universe?',
        timestamp: '02:15 PM',
      },
      {
        sender: 'Model',
        content: 'Black holes are fascinating phenomena in the universe.',
        timestamp: '02:16 PM',
      },
      {
        sender: 'Model',
        content: 'The Great Red Spot on Jupiter is a mesmerizing storm.',
        timestamp: '02:17 PM',
      },
    ],
  },

  {
    id: 8,
    name: 'History of ancient civilizations',
    messages: [
      {
        sender: 'User',
        content: 'Can you provide an overview of ancient civilizations?',
        timestamp: '10:00 AM',
      },
      {
        sender: 'Model',
        content:
          'The Egyptian civilization had an impressive architectural legacy.',
        timestamp: '10:01 AM',
      },
      {
        sender: 'Model',
        content:
          'The Indus Valley civilization was one of the earliest urban societies.',
        timestamp: '10:02 AM',
      },
    ],
  },

  {
    id: 9,
    name: 'Cooking tips for beginners',
    messages: [
      {
        sender: 'User',
        content: 'I want to start cooking. Any tips for beginners?',
        timestamp: '03:45 PM',
      },
      {
        sender: 'Model',
        content: 'Start with simple recipes to build confidence.',
        timestamp: '03:46 PM',
      },
      {
        sender: 'Model',
        content: 'Always follow the recipe measurements accurately.',
        timestamp: '03:47 PM',
      },
    ],
  },

  {
    id: 10,
    name: 'How to grow a garden at home',
    messages: [
      {
        sender: 'User',
        content: `I'm interested in starting a garden at home. Where should I begin?`,
        timestamp: '11:30 AM',
      },
      {
        sender: 'Model',
        content:
          'Choose a sunny spot for your garden to receive enough sunlight.',
        timestamp: '11:31 AM',
      },
      {
        sender: 'Model',
        content:
          'Start with easy-to-grow plants like herbs and cherry tomatoes.',
        timestamp: '11:32 AM',
      },
    ],
  },

  {
    id: 11,
    name: 'The art of storytelling',
    messages: [
      {
        sender: 'User',
        content: 'How can I become a better storyteller?',
        timestamp: '04:15 PM',
      },
      {
        sender: 'Model',
        content: 'Practice using descriptive language to paint vivid images.',
        timestamp: '04:16 PM',
      },
      {
        sender: 'Model',
        content:
          'Engage your audience with compelling characters and plot twists.',
        timestamp: '04:17 PM',
      },
    ],
  },

  {
    id: 12,
    name: 'Different types of teas around the world',
    messages: [
      {
        sender: 'User',
        content:
          'Tell me about the various types of teas from different countries.',
        timestamp: '01:00 PM',
      },
      {
        sender: 'Model',
        content:
          'Green tea originated in China and is known for its health benefits.',
        timestamp: '01:01 PM',
      },
      {
        sender: 'Model',
        content:
          'Assam tea from India is famous for its rich and robust flavor.',
        timestamp: '01:02 PM',
      },
    ],
  },

  {
    id: 13,
    name: 'Tips for a successful job interview',
    messages: [
      {
        sender: 'User',
        content:
          'I have a job interview coming up. Any tips for a successful interview?',
        timestamp: '02:30 PM',
      },
      {
        sender: 'Model',
        content: 'Research the company and come prepared with questions.',
        timestamp: '02:31 PM',
      },
      {
        sender: 'Model',
        content: 'Practice answering common interview questions with a friend.',
        timestamp: '02:32 PM',
      },
    ],
  },

  {
    id: 14,
    name: 'The wonders of the deep ocean',
    messages: [
      {
        sender: 'User',
        content:
          'What are some of the fascinating creatures in the deep ocean?',
        timestamp: '12:45 PM',
      },
      {
        sender: 'Model',
        content:
          'The giant squid is a mysterious and elusive deep-sea creature.',
        timestamp: '12:46 PM',
      },
      {
        sender: 'Model',
        content: 'Bioluminescent organisms light up the dark ocean depths.',
        timestamp: '12:47 PM',
      },
    ],
  },

  {
    id: 15,
    name: 'Learning a new musical instrument',
    messages: [
      {
        sender: 'User',
        content:
          'I want to learn a musical instrument. Which one should I choose?',
        timestamp: '03:00 PM',
      },
      {
        sender: 'Model',
        content: 'The guitar is versatile and a popular choice for beginners.',
        timestamp: '03:01 PM',
      },
      {
        sender: 'Model',
        content:
          'The piano offers a solid foundation in music theory and melody.',
        timestamp: '03:02 PM',
      },
    ],
  },
];
