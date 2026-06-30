"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QRCode } from "react-qr-code";
import { Download, Printer, Copy, Smartphone, QrCode as QrCodeIcon, Table } from "lucide-react";
import toast from "react-hot-toast";

const tables = Array.from({ length: 20 }, (_, i) => ({
  number: i + 1,
  name: `Table ${i + 1}`,
}));

export default function QRCodeMenuPage() {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [baseUrl, setBaseUrl] = useState(
    typeof window !== "undefined" ? `${window.location.origin}/order/self` : "http://localhost:3000/order/self"
  );
  const qrRef = useRef<HTMLDivElement>(null);

  const qrValue = selectedTable
    ? `${baseUrl}?table=${selectedTable}`
    : baseUrl;

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.scale(2, 2);
      ctx?.drawImage(img, 0, 0);
      const png = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qr-table-${selectedTable || "menu"}.png`;
      link.href = png;
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrValue);
    toast.success("Link copied to clipboard");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    printWindow.document.write(`
      <html><head><title>QR Code - Table ${selectedTable || "Menu"}</title>
      <style>body{display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;font-family:sans-serif}
      h1{font-size:24px;margin-bottom:20px} p{color:#666;margin-top:10px}</style></head>
      <body>
        <h1>Scan to Order - ${selectedTable ? `Table ${selectedTable}` : "Menu"}</h1>
        ${svg.outerHTML}
        <p>Point your camera at the QR code to view the menu</p>
        <script>window.print();window.close();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <QrCodeIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">QR Code Menu</h1>
              <p className="text-sm text-muted-foreground">Generate QR codes for contactless self-ordering</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="single">
                <TabsList className="mb-4">
                  <TabsTrigger value="single">Single Table</TabsTrigger>
                  <TabsTrigger value="all">All Tables</TabsTrigger>
                  <TabsTrigger value="general">General Menu</TabsTrigger>
                </TabsList>

                <TabsContent value="single">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Select a table to generate its unique QR code:</p>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {tables.map((table) => (
                        <Button
                          key={table.number}
                          variant={selectedTable === table.number ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTable(table.number)}
                          className="h-12"
                        >
                          <div className="flex flex-col items-center">
                            <Table className="h-3.5 w-3.5" />
                            <span className="text-xs mt-0.5">{table.number}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="all">
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate and print QR codes for all tables at once:
                  </p>
                  <Button className="w-full" size="lg">
                    <Printer className="h-4 w-4 mr-2" />
                    Print All Table QR Codes
                  </Button>
                </TabsContent>

                <TabsContent value="general">
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a general menu QR code (no table assignment):
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => setSelectedTable(null)}
                  >
                    <QrCodeIcon className="h-4 w-4 mr-2" />
                    Generate General Menu QR
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Base URL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="flex-1" />
                <Button variant="outline" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This is the URL customers will be directed to when scanning the QR code.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {selectedTable ? `Table ${selectedTable}` : "General Menu"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div ref={qrRef} className="p-4 bg-white rounded-2xl shadow-sm">
                  <QRCode value={qrValue} size={200} level="M" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Customers scan this code to view the menu and place orders from their phone.
                </p>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-1" /> Print
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
