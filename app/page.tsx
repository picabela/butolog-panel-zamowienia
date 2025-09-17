"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Package, CreditCard, Download, ExternalLink, Wrench, Clock, Shield } from "lucide-react"

// Configuration for InPost API (Test Environment)
const API_CONFIG = {
  API_TOKEN:
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkVzROZW9TeXk0OHpCOHg4emdZX2t5dFNiWHY3blZ0eFVGVFpzWV9TUFA4In0.eyJleHAiOjIwNTc5NTk5MTcsImlhdCI6MTc0MjU5OTkxNywianRpIjoiOGZjMWZiNmQtNTJkOS00ZDNkLTkxZWQtNTA1YTU3MGNmODA3IiwiaXNzIjoiaHR0cHM6Ly9zYW5kYm94LWxvZ2luLmlucG9zdC5wbC9hdXRoL3JlYWxtcy9leHRlcm5hbCIsInN1YiI6ImY6N2ZiZjQxYmEtYTEzZC00MGQzLTk1ZjYtOThhMmIxYmFlNjdiOjR2UlJaSDZHNW1LUWdTa2FQXy0yWFVKd19pT0hvTUIwMDF1aGE4SE5aVzAiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzaGlweCIsInNlc3Npb25fc3RhdGUiOiI0NzI1NjUwMi04NjIzLTQ2YmUtOTRmOC02NTA0YzZmNjk2MTMiLCJzY29wZSI6Im9wZW5pZCBhcGk6YXBpcG9pbnRzIGFwaTpzaGlweCIsInNpZCI6IjQ3MjU2NTAyLTg2MjMtNDZiZS05NGY4LTY1MDRjNmY2OTYxMyIsImFsbG93ZWRfcmVmZXJyZXJzIjoiIiwidXVpZCI6IjMxNzAwYmU3LTA2ZTAtNGVkZC05NTA1LTAzZjJhZjQ3M2QwMiIsImVtYWlsIjoia29udGFrdEBwaWNhYmVsYS5wbCJ9.gi0k1iTptAMC0iAILF9hfU5QsM3xClD59XcAs4Dax7FfGmoQTBlnsirBRO6bdVsAEaAN7eXB6kVzIc2om5bFocK8Xtk_z5ih9Piu-PmLKFp9FABmO1KUbq6ZprKBgZvHGEv01IIAgUvqKWfs_PldlCwwj9pBSjgp5IlGHiO0_xRX0kQiAd6RfIWLYuUi_zjTVltv1jS0eJ_eVmA2TOzxb2UF7mZrEpsIcoWbi_yba9g2GgJ46VxrRDI998TgBENPpMLFOECoG_-y60PF2nSU9Bl92qu0e6knxs_DxNYk_dScM0KKT842MorbniHGXcN-V8AfZzgvV1pxDLeqpb1IGA",
  ORGANIZATION_ID: "5134",
  API_BASE_URL: "https://sandbox-api-shipx-pl.easypack24.net/v1",
  RECIPIENT_DATA: {
    name: "Serwis Napraw",
    email: "kontakt@picabela.pl",
    phone: "+48123456789",
    target_paczkomat: "KRA010",
  },
}

type FormStep = "form" | "payment" | "success" | "error"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceType: string
  description: string
  returnPaczkomat: string
}

interface ShipmentData {
  id: string
  tracking_number?: string
}

export default function RepairOrderForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>("form")
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    serviceType: "",
    description: "",
    returnPaczkomat: "",
  })
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null)
  const [error, setError] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  const serviceTypes = [
    { value: "repair", label: "Usługa naprawcza", price: 99 },
  ]

  const selectedService = serviceTypes[0] // Always use the single service

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const createShipment = async () => {
    const payload = {
      receiver: {
        name: API_CONFIG.RECIPIENT_DATA.name,
        email: API_CONFIG.RECIPIENT_DATA.email,
        phone: API_CONFIG.RECIPIENT_DATA.phone,
        company_name: API_CONFIG.RECIPIENT_DATA.name,
      },
      sender: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        company_name: `${formData.firstName} ${formData.lastName}`,
      },
      parcels: [
        {
          template: "small",
        },
      ],
      service: "inpost_locker_standard",
      custom_attributes: {
        target_point: API_CONFIG.RECIPIENT_DATA.target_paczkomat,
        sending_method: "parcel_locker",
      },
    }

    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/organizations/${API_CONFIG.ORGANIZATION_ID}/shipments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_CONFIG.API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Błąd podczas tworzenia przesyłki")
      }

      const shipment = await response.json()
      return shipment
    } catch (error) {
      console.error("Error creating shipment:", error)
      throw error
    }
  }

  const getShipmentDetails = async (shipmentId: string) => {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/shipments/${shipmentId}`, {
        headers: {
          Authorization: `Bearer ${API_CONFIG.API_TOKEN}`,
        },
      })

      if (!response.ok) {
        throw new Error("Błąd podczas pobierania szczegółów przesyłki")
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting shipment details:", error)
      throw error
    }
  }

  const downloadLabel = async (shipmentId: string) => {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/shipments/${shipmentId}/label`, {
        headers: {
          Authorization: `Bearer ${API_CONFIG.API_TOKEN}`,
        },
      })

      if (!response.ok) {
        throw new Error("Błąd podczas pobierania etykiety")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `etykieta-${shipmentId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading label:", error)
      alert("Błąd podczas pobierania etykiety")
    }
  }

  const pollForTrackingNumber = (shipmentId: string) => {
    const interval = setInterval(async () => {
      try {
        const details = await getShipmentDetails(shipmentId)
        if (details.tracking_number) {
          setShipmentData((prev) => (prev ? { ...prev, tracking_number: details.tracking_number } : null))
          clearInterval(interval)
        }
      } catch (error) {
        console.error("Error polling for tracking number:", error)
        clearInterval(interval)
      }
    }, 3000)

    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(interval), 120000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.returnPaczkomat
    ) {
      setError("Proszę wypełnić wszystkie wymagane pola")
      return
    }

    setCurrentStep("payment")
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(async () => {
      try {
        const shipment = await createShipment()
        setShipmentData(shipment)
        setCurrentStep("success")

        // Start polling for tracking number
        pollForTrackingNumber(shipment.id)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Wystąpił błąd podczas przetwarzania zamówienia")
        setCurrentStep("error")
      } finally {
        setIsProcessing(false)
      }
    }, 2500)
  }

  const resetForm = () => {
    setCurrentStep("form")
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      serviceType: "repair",
      description: "",
      returnPaczkomat: "",
    })
    setShipmentData(null)
    setError("")
  }

  if (currentStep === "payment") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-secondary" />
            </div>
            <CardTitle>Przetwarzanie płatności</CardTitle>
            <CardDescription>Proszę czekać, przetwarzamy Twoje zamówienie...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin mx-auto w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full mb-4"></div>
            <p className="text-sm text-muted-foreground">Generujemy etykietę nadawczą InPost</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Zamówienie złożone!</CardTitle>
            <CardDescription>Twoje zamówienie zostało pomyślnie przetworzone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Szczegóły przesyłki:</h4>
              <p className="text-sm text-muted-foreground">ID: {shipmentData?.id}</p>
              {shipmentData?.tracking_number ? (
                <div className="mt-2">
                  <p className="text-sm font-medium">Numer śledzenia:</p>
                  <a
                    href={`https://inpost.pl/sledzenie-przesylek?number=${shipmentData.tracking_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline flex items-center gap-1 text-sm"
                  >
                    {shipmentData.tracking_number}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">Numer śledzenia będzie dostępny za kilka minut...</p>
              )}
            </div>

            <Button onClick={() => shipmentData && downloadLabel(shipmentData.id)} className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Pobierz etykietę nadawczą
            </Button>

            <Button onClick={resetForm} className="w-full">
              Złóż kolejne zamówienie
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Wystąpił błąd</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={resetForm} className="w-full">
              Spróbuj ponownie
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-6 h-6 text-secondary" />
              <h1 className="text-xl font-bold text-foreground">Serwis Napraw</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Strona główna
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Usługi
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Kontakt
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Zamów naprawę swojego przedmiotu</h2>
            <p className="text-muted-foreground text-lg text-pretty">
              Profesjonalne usługi naprawcze z wygodną wysyłką przez Paczkomaty InPost
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <Shield className="w-8 h-8 text-secondary" />
              <div>
                <h3 className="font-medium text-sm">Gwarancja jakości</h3>
                <p className="text-xs text-muted-foreground">6 miesięcy gwarancji</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <Clock className="w-8 h-8 text-secondary" />
              <div>
                <h3 className="font-medium text-sm">Szybka realizacja</h3>
                <p className="text-xs text-muted-foreground">3-5 dni roboczych</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <Package className="w-8 h-8 text-secondary" />
              <div>
                <h3 className="font-medium text-sm">Wygodna wysyłka</h3>
                <p className="text-xs text-muted-foreground">Paczkomaty InPost</p>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle>Formularz zamówienia</CardTitle>
              <CardDescription>Wypełnij formularz, aby zamówić usługę naprawczą</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Dane kontaktowe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Imię *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="Wprowadź imię"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nazwisko *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Wprowadź nazwisko"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="twoj@email.pl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+48 123 456 789"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Service Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Usługa naprawcza</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Usługa naprawcza</span>
                      <Badge variant="secondary" className="text-lg font-bold">
                        99 zł brutto
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Profesjonalna naprawa z gwarancją jakości
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Opis problemu</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Opisz szczegółowo problem z przedmiotem..."
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                {/* Shipping Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Wysyłka zwrotna</h3>
                  <div className="space-y-2">
                    <Label htmlFor="returnPaczkomat">Paczkomat odbioru *</Label>
                    <Input
                      id="returnPaczkomat"
                      value={formData.returnPaczkomat}
                      onChange={(e) => handleInputChange("returnPaczkomat", e.target.value)}
                      placeholder="np. KRA010"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Podaj kod Paczkomatu, do którego chcesz otrzymać naprawiony przedmiot
                    </p>
                  </div>
                </div>

                {/* Order Summary */}
                <Separator />
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Podsumowanie zamówienia</h3>
                  <div className="flex justify-between items-center">
                    <span>Usługa naprawcza</span>
                    <span className="font-medium text-lg">99 zł brutto</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    * Cena może ulec zmianie po ocenie przedmiotu
                  </div>
                </div>

                {/* Hidden field for service type */}
                <input type="hidden" value="repair" onChange={(e) => handleInputChange("serviceType", e.target.value)} />

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Opłać zamówienie i generuj etykietę
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Serwis Napraw. Wszystkie prawa zastrzeżone.</p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="#" className="hover:text-foreground">
                Polityka prywatności
              </a>
              <a href="#" className="hover:text-foreground">
                Regulamin
              </a>
              <a href="#" className="hover:text-foreground">
                Kontakt
              </a>
                    </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
