import { Building2, Calendar } from "lucide-react";

const Header = () => {
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Relatório de Atividades
              </h1>
              <p className="text-sm text-muted-foreground">
                GeoMK Soluções • Sebrae Ceará
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">{currentDate}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
