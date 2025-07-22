"use client";

import { SearchInput } from "@/components/search-input";
import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type CityWithDept = { city: string; departement_code: string };

const RootPage = () => {
    const [cities, setCities] = useState<CityWithDept[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await fetch(`${API_URL}/addresses/cities`);
                if (!res.ok) throw new Error("Failed to fetch cities");
                const data = await res.json();
                setCities(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };
        fetchCities();
    }, []);

    return (
        <div className="h-full p-4 space-y-6">
            <Suspense fallback={
                <div className="relative">
                    <div className="absolute h-4 w-4 top-3 left-4 text-muted-foreground" />
                    <div className="pl-10 bg-primary/10 h-10 rounded-md animate-pulse bg-gray-200" />
                </div>
            }>
                <SearchInput />
            </Suspense>

            {/* Cities Section */}
            <div>
                <h2 className="text-xl font-bold mb-2">Villes</h2>
                {loading ? (
                    <div className="text-muted-foreground">Chargement des villes...</div>
                ) : error ? (
                    <div className="text-red-500">Erreur: {error}</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {cities.map(({ city, departement_code }) => (
                            <Card
                                key={city}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => router.push(`/city/${encodeURIComponent(city)}`)}
                            >
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                                    <CardTitle className="text-sm font-medium leading-tight">
                                        {city} <span className="text-muted-foreground">({departement_code})</span>
                                    </CardTitle>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RootPage;