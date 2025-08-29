import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, Shield, TrendingUp, Wallet, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge
              className="mb-6 silk-gradient text-white border-0"
              variant="secondary"
            >
              🚀 Phase 1C.1 - AutoMine Platform
            </Badge>

            <h1 className="mb-6 silk-gradient-text">
              Automated NFT Mining
              <br />
              <span className="text-foreground">Made Simple</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Experience the future of NFT mining with our intelligent
              automation platform. Stake, mine, and earn rewards effortlessly on
              Bitkub Chain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="silk-gradient text-white border-0 silk-hover px-8 py-3"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="silk-border silk-hover px-8 py-3"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 silk-gradient rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4">Why Choose AutoMine?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for efficiency, designed for growth. Our platform combines
              cutting-edge technology with user-friendly interfaces.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="silk-hover silk-shadow border-border/50">
              <CardHeader>
                <div className="w-12 h-12 silk-gradient rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Automated Mining</CardTitle>
                <CardDescription>
                  Set it and forget it. Our intelligent algorithms handle the
                  mining process automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="silk-hover silk-shadow border-border/50">
              <CardHeader>
                <div className="w-12 h-12 silk-gradient rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Built on Bitkub Chain with enterprise-grade security and 99.9%
                  uptime guarantee.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="silk-hover silk-shadow border-border/50">
              <CardHeader>
                <div className="w-12 h-12 silk-gradient rounded-lg flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Maximize Rewards</CardTitle>
                <CardDescription>
                  Optimize your earnings with our advanced reward distribution
                  and staking mechanisms.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="silk-hover silk-shadow border-border/50">
              <CardHeader>
                <div className="w-12 h-12 silk-gradient rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Real-time Analytics</CardTitle>
                <CardDescription>
                  Track your performance with comprehensive dashboards and
                  detailed analytics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="silk-hover silk-shadow border-border/50">
              <CardHeader>
                <div className="w-12 h-12 silk-gradient rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Community Driven</CardTitle>
                <CardDescription>
                  Join thousands of miners in our vibrant community and share
                  strategies.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="silk-hover silk-shadow border-border/50">
              <CardHeader>
                <div className="w-12 h-12 silk-gradient rounded-lg flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Easy Integration</CardTitle>
                <CardDescription>
                  Connect your wallet in seconds and start mining with just a
                  few clicks.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="silk-glass silk-shadow-lg border-border/30 max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <h3 className="mb-4">Ready to Start Mining?</h3>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join the future of automated NFT mining. Connect your wallet and
                start earning rewards today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="silk-gradient text-white border-0 silk-hover px-8 py-3"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Get Started Now
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="silk-hover px-8 py-3"
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
