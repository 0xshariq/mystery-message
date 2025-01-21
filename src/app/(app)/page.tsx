'use client'
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from 'embla-carousel-autoplay';
import messages from "@/messages.json";

export default function DashboardHome() {
  return (
    <>
        <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12">
      <section className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold">
          Dive into the World of Anonymous Conversations
        </h1>
        <p className="mt-3 md:mt-4 text-base md:text-lg">
          Explore Mystery Message - Where your Identity remains a secret
        </p>
      </section>
      <div>
        <Carousel
        plugins={[Autoplay({delay: 2000})]}
        className="w-full max-w-xs">
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index}>
                <Card>
                    <CardHeader>{message.title}</CardHeader>
                  <CardContent>
                    <p className="text-sm">{message.content}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </main>
    <footer className="mb-0">
        <div className="bg-gray-800 text-white p-4 text-center">
            <p className="text-sm">
            &copy; 2025 Mystery Message. All Rights Reserved.
            </p>
        </div>
    </footer>
    </>
  );
}
