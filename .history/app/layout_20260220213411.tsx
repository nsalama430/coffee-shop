@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@layer base {
  :root {
    /* --- Light Mode (الخلفية بيضاء مع ألوان الباليت الفاتحة) --- */
    --background: 0 0% 100%; /* أبيض صريح كما طلبتِ */
    --foreground: 25 34% 33%; /* بني غامق للنصوص #6F4E37 */
    
    --card: 0 0% 100%;
    --card-foreground: 25 34% 33%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 25 34% 33%;
    
    --primary: 26 29% 50%; /* البني المتوسط للأزرار #A67B5B */
    --primary-foreground: 30 97% 95%; /* نص بيج فاتح جداً فوق الزرار */
    
    --secondary: 30 75% 69%; /* لون بيج مميز #ECB176 */
    --secondary-foreground: 25 34% 33%;
    
    --muted: 30 55% 95%; /* خلفية باهتة مائلة للبيج #FED8B1 */
    --muted-foreground: 25 20% 45%;
    
    --accent: 30 75% 69%; /* لون التمييز #ECB176 */
    --accent-foreground: 25 34% 33%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    
    --border: 26 29% 50%; /* حدود بنية متناسقة */
    --input: 26 29% 50%;
    --ring: 25 34% 33%;
    
    --radius: 0.5rem;

    /* Sidebar Light */
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 25 34% 33%;
    --sidebar-primary: 26 29% 50%;
    --sidebar-accent: 30 75% 69%;
  }

  .dark {
    /* --- Dark Mode (الخلفية سوداء مع ألوان الباليت الغامقة) --- */
    --background: 0 0% 3.9%; /* أسود صريح كما طلبتِ */
    --foreground: 28 28% 85%; /* نصوص بيج فاتحة جداً #DBCBBD */
    
    --card: 0 0% 7%;
    --card-foreground: 28 28% 85%;
    
    --popover: 0 0% 7%;
    --popover-foreground: 28 28% 85%;
    
    --primary: 22 65% 32%; /* بني محروق فخم #87431D */
    --primary-foreground: 28 28% 85%;
    
    --secondary: 25 57% 52%; /* اللون النحاسي #C87941 */
    --secondary-foreground: 359 100% 5%; /* نص غامق جداً فوق النحاسي */
    
    --muted: 359 50% 12%; /* خلفية داكنة جداً مائلة للقهوة #290001 */
    --muted-foreground: 28 20% 70%;
    
    --accent: 25 57% 52%; /* لون التمييز النحاسي #C87941 */
    --accent-foreground: 359 100% 5%;
    
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    
    --border: 22 65% 32%;
    --input: 22 65% 32%;
    --ring: 25 57% 52%;

    /* Sidebar Dark */
    --sidebar-background: 0 0% 5%;
    --sidebar-foreground: 28 28% 85%;
    --sidebar-primary: 22 65% 32%;
    --sidebar-accent: 25 57% 52%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}