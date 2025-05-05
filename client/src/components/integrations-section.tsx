import { useState } from "react";
import { FaGoogle, FaInstagram, FaStar, FaStarHalfAlt, FaExternalLinkAlt } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { getRatingStars } from "@/lib/utils";

interface Review {
  id: number;
  name: string;
  avatarInitial: string;
  rating: number;
  comment: string;
  date: string;
}

interface InstagramPost {
  id: number;
  imageUrl: string;
  likes: number;
  postUrl: string;
}

export function IntegrationsSection() {
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ['/api/reviews'],
  });
  
  const { data: instagramPosts, isLoading: isLoadingPosts } = useQuery<InstagramPost[]>({
    queryKey: ['/api/instagram-posts'],
  });
  
  // Calculate average rating
  const averageRating = reviews?.reduce((acc, review) => acc + review.rating, 0) || 0;
  const formattedRating = reviews && reviews.length > 0 
    ? (averageRating / reviews.length).toFixed(1) 
    : '4.8';
  
  // For display purposes, limit to top 2 reviews
  const topReviews = reviews?.slice(0, 2) || [];
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Google Maps Reviews */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-poppins font-medium flex items-center">
                <FaGoogle className="text-red-500 mr-3" /> Avaliações no Google
              </h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-4">
                  <span className="text-3xl font-bold mr-2">{formattedRating}</span>
                  <div className="flex">
                    {getRatingStars(parseFloat(formattedRating)).map((starType, index) => (
                      <span key={index}>
                        {starType === 'full' && <FaStar className="text-yellow-400" />}
                        {starType === 'half' && <FaStarHalfAlt className="text-yellow-400" />}
                        {starType === 'empty' && <FaStar className="text-gray-400" />}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-gray-400">
                  Baseado em {reviews?.length || 127} avaliações
                </span>
              </div>
              
              {/* Review Cards */}
              <div className="space-y-4">
                {isLoadingReviews ? (
                  // Loading skeletons
                  Array(2).fill(0).map((_, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 animate-pulse">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-white/10 mr-3"></div>
                        <div>
                          <div className="w-32 h-4 bg-white/10 rounded mb-1"></div>
                          <div className="flex">
                            {Array(5).fill(0).map((_, i) => (
                              <div key={i} className="w-4 h-4 mr-1 bg-white/10 rounded-full"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="w-full h-16 bg-white/10 rounded"></div>
                    </div>
                  ))
                ) : (
                  topReviews.map((review) => (
                    <div key={review.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                          <span className="text-lg font-medium">{review.avatarInitial}</span>
                        </div>
                        <div>
                          <p className="font-medium">{review.name}</p>
                          <div className="flex">
                            {Array(5).fill(0).map((_, index) => (
                              <FaStar 
                                key={index}
                                className={`text-sm ${
                                  index < review.rating ? 'text-yellow-400' : 'text-gray-400'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-6 text-center">
                <a 
                  href="https://g.co/kgs/qgzEhNu" 
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center justify-center"
                >
                  <FaExternalLinkAlt className="mr-2" /> Ver todas as avaliações no Google
                </a>
              </div>
            </div>
          </div>
          
          {/* Instagram Feed */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-poppins font-medium flex items-center">
                <FaInstagram className="text-pink-500 mr-3" /> @douglas.autocar
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-3 gap-2">
                {isLoadingPosts ? (
                  // Loading skeletons
                  Array(6).fill(0).map((_, index) => (
                    <div 
                      key={index} 
                      className="rounded-lg overflow-hidden bg-white/10 aspect-square animate-pulse"
                    ></div>
                  ))
                ) : (
                  instagramPosts?.slice(0, 6).map((post) => (
                    <a 
                      key={post.id}
                      href={post.postUrl} 
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg overflow-hidden relative group"
                    >
                      <img 
                        src={post.imageUrl} 
                        alt="Instagram post" 
                        className="w-full aspect-square object-cover transition-transform group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FaStar className="text-white mr-1" />
                        <span className="text-white text-sm">{post.likes}</span>
                      </div>
                    </a>
                  ))
                )}
              </div>
              
              <div className="mt-6 text-center">
                <a 
                  href="https://www.instagram.com/douglas.autocar/" 
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center justify-center"
                >
                  <FaInstagram className="mr-2" /> Siga-nos no Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
