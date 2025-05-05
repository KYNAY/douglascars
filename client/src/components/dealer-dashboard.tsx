import { useQuery } from "@tanstack/react-query";

interface Dealer {
  id: number;
  name: string;
  startDate: string;
  points: number;
  sales: number;
}

export function DealerDashboard() {
  const { data: dealers, isLoading } = useQuery<Dealer[]>({
    queryKey: ['/api/dealers/ranking'],
  });
  
  // Helper function to get performance percentage based on points relative to top dealer
  const getPerformancePercentage = (points: number) => {
    if (!dealers || dealers.length === 0) return 0;
    const topPoints = dealers[0].points;
    return Math.round((points / topPoints) * 100);
  };
  
  // Helper function to get performance color
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    return 'bg-yellow-500';
  };
  
  // Helper function to format date
  const formatStartDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    return `Desde ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-poppins font-bold mb-8 text-center">Dashboard de Vendedores</h2>
        
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-xl font-medium">Ranking de Vendas</h3>
            <div className="flex items-center">
              <span className="text-gray-300 mr-2">Atualizado em tempo real</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left pb-4 text-gray-400 font-medium">Posição</th>
                    <th className="text-left pb-4 text-gray-400 font-medium">Vendedor</th>
                    <th className="text-left pb-4 text-gray-400 font-medium">Vendas</th>
                    <th className="text-left pb-4 text-gray-400 font-medium">Pontos</th>
                    <th className="text-left pb-4 text-gray-400 font-medium">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    // Loading skeleton
                    Array(3).fill(0).map((_, index) => (
                      <tr key={index} className="border-b border-white/5">
                        <td className="py-4">
                          <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse mr-3"></div>
                            <div>
                              <div className="w-32 h-4 bg-white/10 animate-pulse rounded"></div>
                              <div className="w-24 h-3 bg-white/10 animate-pulse rounded mt-2"></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="w-8 h-4 bg-white/10 animate-pulse rounded"></div>
                        </td>
                        <td className="py-4">
                          <div className="w-12 h-4 bg-white/10 animate-pulse rounded"></div>
                        </td>
                        <td className="py-4">
                          <div className="w-full bg-white/10 rounded-full h-2"></div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    dealers?.map((dealer, index) => {
                      const performance = getPerformancePercentage(dealer.points);
                      const performanceColor = getPerformanceColor(performance);
                      
                      return (
                        <tr key={dealer.id} className="border-b border-white/5">
                          <td className="py-4 flex items-center">
                            <div className={`w-8 h-8 rounded-full ${
                              index === 0 ? 'bg-primary/20' :
                              index === 1 ? 'bg-gray-700/30' :
                              index === 2 ? 'bg-yellow-600/20' : 'bg-white/10'
                            } flex items-center justify-center mr-2`}>
                              <span className="font-medium">{index + 1}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                                <span className="text-lg font-medium">{dealer.name.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-medium">{dealer.name}</p>
                                <p className="text-sm text-gray-400">
                                  {formatStartDate(dealer.startDate)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="font-medium">{dealer.sales}</span>
                          </td>
                          <td className="py-4">
                            <span className="font-medium">{dealer.points}</span>
                          </td>
                          <td className="py-4">
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div 
                                className={`${performanceColor} h-2 rounded-full`} 
                                style={{ width: `${performance}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-6 border-t border-white/10 flex justify-between">
            <p className="text-gray-300 text-sm">
              Os pontos são calculados com base nas vendas realizadas e podem ser reduzidos caso uma venda seja desmarcada.
            </p>
            <a href="#" className="text-primary hover:underline">Ver detalhes</a>
          </div>
        </div>
      </div>
    </section>
  );
}
