import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MapPin, User, Phone, Clock, Tag, Image as ImageIcon, 
  AlertTriangle, Eye, Share2, Heart, MessageCircle, Star, Badge as BadgeIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useItem } from '../hooks/useItems';
import { formatDistanceToNow } from 'date-fns';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { ItemMessagingButton } from '../components/messaging/ItemMessagingButton';
import SplitText from '../components/ui/SplitText';

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const { data: item, isLoading, error } = useItem(id!);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'lost' 
      ? 'bg-amber-100 text-amber-800 border-amber-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };



  const handlePhoneClick = (phone: string) => {
    if (!user) {
      // Redirect to login with return URL
      window.location.href = `/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item?.title,
          text: `Check out this ${item?.item_type} item: ${item?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading item details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-12">
            <Card className="elegant-card max-w-md">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <SplitText
                  text="Item Not Found"
                  className="text-xl font-semibold text-gray-900 mb-2"
                  delay={80}
                  duration={0.5}
                  ease="power2.out"
                  splitType="words"
                  from={{ opacity: 0, y: 20 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.5}
                  rootMargin="-50px"
                  textAlign="center"
                />
                <p className="text-gray-600 mb-4">The item you're looking for doesn't exist or has been removed.</p>
                <Link to="/items/browse">
                  <Button className="elegant-button">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Browse
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (item.status !== 'approved' && (!user || item.user_id !== user.id)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-12">
            <Card className="elegant-card max-w-md">
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <SplitText
                  text="Item Not Available"
                  className="text-xl font-semibold text-gray-900 mb-2"
                  delay={80}
                  duration={0.5}
                  ease="power2.out"
                  splitType="words"
                  from={{ opacity: 0, y: 20 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.5}
                  rootMargin="-50px"
                  textAlign="center"
                />
                <p className="text-gray-600 mb-4">
                  {item.status === 'pending' 
                    ? 'This item is still under review and will be available once approved.'
                    : 'This item is not currently available for viewing.'
                  }
                </p>
                <Link to="/items/browse">
                  <Button className="elegant-button">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Browse
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/items/browse">
            <Button variant="outline" className="elegant-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="solid-card bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
              <CardContent className="p-8 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 item-title">
                      {item.title}
                    </h1>
                    <div className="flex flex-wrap gap-3">
                      <Badge className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm border-0 shadow-sm ${
                        item.item_type === 'lost' 
                          ? 'bg-red-100 text-red-800 status-lost' 
                          : 'bg-green-100 text-green-800 status-found'
                      }`}>
                        {item.item_type === 'lost' ? '🔍 Lost Item' : '✅ Found Item'}
                      </Badge>
                      <Badge className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm border-0 shadow-sm ${getStatusColor(item.status)}`}>
                        {item.status === 'approved' ? '✅ Available' : `📋 ${item.status}`}
                      </Badge>
                      {item.is_urgent && (
                        <Badge className="bg-red-100 text-red-800 font-medium px-4 py-2 rounded-full text-sm border-0 shadow-sm">
                          🚨 Urgent
                        </Badge>
                      )}
                      {item.reward_offered && (
                        <Badge className="bg-yellow-100 text-yellow-800 font-medium px-4 py-2 rounded-full text-sm border-0 shadow-sm">
                          💰 ${item.reward_offered} Reward
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={handleShare} className="share-button action-button">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="share-button action-button">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap item-description text-base">{item.description}</p>
                </div>
              </CardContent>
            </Card>

            {item.images && item.images.length > 0 && (
              <Card className="solid-card bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50 border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <ImageIcon className="h-5 w-5 text-gray-600" />
                    Images ({item.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {item.images.map((imageUrl, index) => (
                      <div key={index} className="image-container aspect-square bg-gray-50 rounded-lg overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={imageUrl}
                          alt={`${item.title} - Image ${index + 1}`}
                          className="item-image w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="solid-card bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Tag className="h-5 w-5 text-gray-600" />
                  Item Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Tag className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 meta-text">Category</p>
                        <p className="font-semibold text-gray-900">{typeof item.category === 'string' ? item.category : (item.category as any)?.name || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 meta-text">Location</p>
                        <p className="font-semibold text-gray-900">{typeof item.location === 'string' ? item.location : (item.location as any)?.name || 'Not specified'}</p>
                        {item.specific_location && (
                          <p className="text-sm text-gray-600 meta-text">{item.specific_location}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 meta-text">Date {item.item_type}</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(item.date_lost_found).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {item.time_lost_found && (
                          <p className="text-sm text-gray-600 meta-text">at {item.time_lost_found}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 meta-text">Views</p>
                        <p className="font-semibold text-gray-900">{item.views_count || 0} views</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 meta-text">Posted</p>
                        <p className="font-semibold text-gray-900">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {item.item_type === 'lost' && (
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Star className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 meta-text">Status</p>
                          <p className="font-semibold text-gray-900">
                            {item.status === 'resolved' ? 'Found & Reunited! 🎉' : 'Still Missing'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 sidebar">
            <Card className="solid-card bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden" id="contact">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Contact Owner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6 bg-white">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {(item as any).profiles?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{(item as any).profiles?.full_name || 'Anonymous'}</p>
                    {(item as any).profiles?.student_id && (
                      <p className="text-sm text-gray-600 meta-text">Student ID: {(item as any).profiles.student_id}</p>
                    )}
                  </div>
                </div>


                <div className="space-y-4">
                  {item.contact_phone && (
                    <Button 
                      variant="outline"
                      onClick={() => handlePhoneClick(item.contact_phone)}
                      className="w-full action-button bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300 font-semibold py-3"
                      disabled={!user}
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Call {item.contact_phone}
                    </Button>
                  )}

                  {/* Message Owner Button - Always show prominently */}
                  <div className="space-y-4 border-t border-gray-100 pt-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Owner</h3>
                    </div>
                    
                    {user && item.user_id !== user.id ? (
                      <div className="space-y-3">
                        <ItemMessagingButton
                          itemId={item.id}
                          ownerId={item.user_id}
                          variant="default"
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold py-4 text-base rounded-xl"
                          size="lg"
                        />
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700 font-medium">
                            💬 Send a secure message to the owner
                          </p>
                        </div>
                      </div>
                    ) : !user ? (
                      <div className="space-y-3">
                        <Link to={`/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`}>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold py-4 text-base rounded-xl">
                            <MessageCircle className="h-5 w-5 mr-2" />
                            Sign In to Message Owner
                          </Button>
                        </Link>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700 font-medium">
                            💬 Sign in to send secure messages
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">This is your item</p>
                      </div>
                    )}
                  </div>

                </div>
              </CardContent>
            </Card>

            <Card className="solid-card bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-gray-900 text-lg">
                  {item.item_type === 'lost' ? '🔍 Found This Item?' : '👋 Is This Yours?'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="space-y-4 text-sm text-gray-700">
                  {item.item_type === 'lost' ? (
                    <>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-500 font-bold">•</span>
                        <p className="font-medium">Contact the owner using the information above</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-500 font-bold">•</span>
                        <p className="font-medium">Be prepared to describe the item to verify ownership</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-500 font-bold">•</span>
                        <p className="font-medium">Arrange a safe meeting place on campus</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-500 font-bold">•</span>
                        <p className="font-medium">Report spam or inappropriate content</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">•</span>
                        <p className="font-medium">Contact the finder using the information above</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">•</span>
                        <p className="font-medium">Be ready to prove ownership of the item</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">•</span>
                        <p className="font-medium">Arrange to meet in a public campus location</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">•</span>
                        <p className="font-medium">Thank the finder for their honesty! 🙏</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="solid-card bg-blue-50 border border-blue-200 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-blue-100 border-b border-blue-200">
                <CardTitle className="text-blue-800 flex items-center gap-2 text-lg">
                  <BadgeIcon className="h-5 w-5" />
                  Safety First
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-blue-50">
                <div className="space-y-4 text-sm text-blue-800">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="font-semibold">Always meet in public campus areas</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="font-semibold">Bring a friend when meeting strangers</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="font-semibold">Verify identity before sharing personal info</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="font-semibold">Report suspicious behavior to campus security</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ItemDetail; 