"use client";

import { Search, MessageCircle, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEventHandler, useEffect, useState, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/api";
import qs from "query-string";

interface Restaurant {
  id: number;
  name: string;
  description: string;
  rating: number;
  address?: {
    city: string;
    street: string;
  };
  specialities?: Array<{
    id: number;
    name: string;
  }>;
}

interface ChatbotResponse {
  restaurants: Restaurant[];
  message: string;
}

export const ChatbotSearchInput = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const categoryId = searchParams.get("categoryId");
    const name = searchParams.get("name");

    const [value, setValue] = useState(name || "");
    const [isChatbotMode, setIsChatbotMode] = useState(false);
    const [chatbotResults, setChatbotResults] = useState<ChatbotResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const debouncedValue = useDebounce<string>(value, 500);

    const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setValue(e.target.value);
        setShowResults(false);
        setChatbotResults(null);
    }

    const handleChatbotSearch = async () => {
        if (!value.trim()) return;
        
        setIsLoading(true);
        try {
            const response = await api.restaurants.chatbot(value);
            setChatbotResults(response);
            setShowResults(true);
        } catch (error) {
            console.error('Chatbot search error:', error);
            setChatbotResults({
                restaurants: [],
                message: 'Erreur lors de la recherche. Veuillez réessayer.'
            });
            setShowResults(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegularSearch = useCallback(() => {
        const query = {
            name: debouncedValue,
            categoryId: categoryId
        };

        const url = qs.stringifyUrl({
            url: window.location.href,
            query,
        }, { skipEmptyString: true, skipNull: true });

        router.push(url);
    }, [debouncedValue, categoryId, router]);

    useEffect(() => {
        if (!isChatbotMode) {
            handleRegularSearch();
        }
    }, [debouncedValue, isChatbotMode, handleRegularSearch]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isChatbotMode) {
            handleChatbotSearch();
        }
    };

    const handleRestaurantClick = (restaurantId: number) => {
        router.push(`/restaurant/${restaurantId}`);
        setShowResults(false);
    };

    return (
        <div className="relative space-y-4">
            <div className="relative">
                <Search className="absolute h-4 w-4 top-3 left-4 text-muted-foreground" />
                <Input 
                    onChange={onChange}
                    onKeyPress={handleKeyPress}
                    value={value}
                    placeholder={isChatbotMode ? "Ex: restaurants italiens paris, sushi lyon..." : "Search..."}
                    className="pl-10 bg-primary/10 pr-20"
                />
                <div className="absolute right-2 top-2 flex gap-2">
                    <Button
                        variant={isChatbotMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setIsChatbotMode(!isChatbotMode);
                            setShowResults(false);
                            setChatbotResults(null);
                        }}
                        className="h-6 px-2"
                    >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        IA
                    </Button>
                    {isChatbotMode && (
                        <Button
                            size="sm"
                            onClick={handleChatbotSearch}
                            disabled={isLoading || !value.trim()}
                            className="h-6 px-2"
                        >
                            {isLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Search className="h-3 w-3" />
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Chatbot Results */}
            {showResults && chatbotResults && (
                <Card className="mt-4">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <CardTitle className="text-lg">{chatbotResults.message}</CardTitle>
                            <Badge variant="secondary">
                                {chatbotResults.restaurants.length} résultat{chatbotResults.restaurants.length > 1 ? 's' : ''}
                            </Badge>
                        </div>
                        
                        {chatbotResults.restaurants.length > 0 ? (
                            <div className="space-y-3">
                                {chatbotResults.restaurants.map((restaurant) => (
                                    <Card 
                                        key={restaurant.id} 
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => handleRestaurantClick(restaurant.id)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {restaurant.description}
                                                    </p>
                                                    {restaurant.address && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            📍 {restaurant.address.street}, {restaurant.address.city}
                                                        </p>
                                                    )}
                                                    {restaurant.specialities && restaurant.specialities.length > 0 && (
                                                        <div className="flex gap-1 mt-2">
                                                            {restaurant.specialities.map((speciality) => (
                                                                <Badge key={speciality.id} variant="outline" className="text-xs">
                                                                    {speciality.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 ml-4">
                                                    <span className="text-sm font-medium">⭐</span>
                                                    <span className="text-sm">{restaurant.rating || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                             <p>Aucun restaurant trouvé pour cette recherche.</p>
                             <p className="text-sm mt-1">Essayez avec d&apos;autres mots-clés.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Help Text for Chatbot Mode */}
            {isChatbotMode && !showResults && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    <p className="font-medium mb-2">💡 Exemples de recherches :</p>
                                         <ul className="space-y-1 text-xs">
                         <li>• &quot;restaurants italiens paris&quot;</li>
                         <li>• &quot;sushi lyon&quot;</li>
                         <li>• &quot;pizza marseille&quot;</li>
                         <li>• &quot;restaurants chinois&quot;</li>
                         <li>• &quot;café bordeaux&quot;</li>
                     </ul>
                </div>
            )}
        </div>
    );
};
