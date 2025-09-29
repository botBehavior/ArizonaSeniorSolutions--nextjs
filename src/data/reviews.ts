export interface SharedReview {
  name: string
  rating: number
  text: string
  location: string
  relationship: string
  time: number
}

export const fallbackReviews: SharedReview[] = [
  {
    name: "Robert L.",
    rating: 5,
    text: "CaroleLynne is the perfect advocate for finding placement for you and or your beloved family member. She has years of experience helping families bringing a multitude of success stories finding the right match for the needs at hand. You can't go wrong with Senior Care Solutions of Arizona.",
    location: "Phoenix, AZ",
    relationship: "Family Member",
    time: Date.now() - 86400000 * 30 // 30 days ago
  },
  {
    name: "Len B.",
    rating: 5,
    text: "CaroleLynne was a tremendous help to our family when we needed to get my mother into a care facility. Senior Care Solutions of AZ provided us with answers and suggestions that we needed to make good decisions. I highly recommend asking CaroleLynne for assistance when caring for your loved one.",
    location: "Scottsdale, AZ",
    relationship: "Son",
    time: Date.now() - 86400000 * 45 // 45 days ago
  },
  {
    name: "Sharin D.",
    rating: 5,
    text: "As a SNF case manager, I have worked with Carol-Lynne for years. I have seen her work tirelessly to find safe placement for many patients. I can always count on her to do what's right for her clients regardless of the time spent or the compensation. Her work ethic and kindness is a rarity in todays world.",
    location: "Tempe, AZ",
    relationship: "Healthcare Professional",
    time: Date.now() - 86400000 * 60 // 60 days ago
  },
  {
    name: "Cheryl",
    rating: 5,
    text: "I just wanted you to know how much I appreciated your help and expertise in walking this journey with my mom and me. Thank you so much for the strength and courage to step up and fulfill this need that most of us will face but never consider until the day it becomes \"overwhelming.\" First of all, it was such a pleasure to meet you. We knew immediately we could trust your direction. You were so reassuring and what our needs were. Definitely a breath of fresh air in today's world. You listened to us and continually kept in mind what our needs were. Mom only had two weeks but what a complete joy. ███ and her staff were amazing! The attention and care she received made her so happy. I pray that God will richly bless you for your care and giving to others in this way. When you don't know where to turn and find someone like you to help with the journey – well, it's just hard to find the words for the gratefulness felt during such a time. Blessings, dear friend. Thank you for everything, your time, your help, your sweetness, etc. . . .",
    location: "Gilbert, AZ",
    relationship: "Daughter",
    time: Date.now() - 86400000 * 7 // Recent review (7 days ago)
  }
]
