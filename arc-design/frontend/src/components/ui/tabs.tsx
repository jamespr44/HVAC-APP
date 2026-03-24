import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{ active: string; setActive: (v: string) => void }>({ active: '', setActive: () => {} });

const Tabs = ({ defaultValue, children }: { defaultValue: string, children: React.ReactNode }) => {
  const [active, setActive] = React.useState(defaultValue);
  return <TabsContext.Provider value={{ active, setActive }}><div className="w-full">{children}</div></TabsContext.Provider>;
}

const TabsList = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)}>
    {children}
  </div>
)

const TabsTrigger = ({ value, children, className }: { value: string, children: React.ReactNode, className?: string }) => {
  const { active, setActive } = React.useContext(TabsContext);
  return (
    <button 
      onClick={() => setActive(value)} 
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        active === value ? "bg-background text-foreground shadow" : "", 
        className
      )}
    >
      {children}
    </button>
  );
}

const TabsContent = ({ value, children, className }: { value: string, children: React.ReactNode, className?: string }) => {
  const { active } = React.useContext(TabsContext);
  if (active !== value) return null;
  return (
    <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
